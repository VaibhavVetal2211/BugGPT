from fastapi import FastAPI, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
import socketio
import pdfplumber
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
import csv
import tempfile
import datetime
import json
import pandas as pd  # Add this import

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=["http://localhost:5173"])
socket_app = socketio.ASGIApp(sio)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from src.routers import scan, report, health

app.include_router(scan.router, prefix="/api/scan", tags=["scan"])
app.include_router(report.router, prefix="/api/report", tags=["report"])
app.include_router(health.router, prefix="/api")

# CSV file to store scan results
CSV_FILE = "scan_results.csv"

# Function to save scan results to CSV
def save_scan_results(scan_data):
    file_exists = os.path.isfile(CSV_FILE)
    with open(CSV_FILE, mode="a", newline="") as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["Issue", "Severity", "Affected Paths", "Scan Date"])
        for finding in scan_data["detailed_findings"]:
            writer.writerow([finding["issue"], finding["severity"], ", ".join(finding["affected"]), scan_data["scan_date"]])

# Function to read scan results from CSV
def read_scan_results():
    if not os.path.isfile(CSV_FILE):
        return None
    return pd.read_csv(CSV_FILE)

# Function to create a severity chart
def create_severity_chart(df, output_dir):
    severity_counts = df["Severity"].value_counts()
    plt.figure(figsize=(6, 4))
    severity_counts.plot(kind="bar", color=["red", "orange", "green"])
    plt.xlabel("Severity Level")
    plt.ylabel("Count")
    plt.title("Severity Distribution")
    chart_path = os.path.join(output_dir, "severity_chart.png")
    plt.savefig(chart_path)
    plt.close()
    return chart_path

# Function to generate PDF report from CSV data
def generate_pdf_from_csv():
    df = read_scan_results()
    if df is None or df.empty:
        return None
    output_dir = tempfile.mkdtemp()
    chart_path = create_severity_chart(df, output_dir)
    pdf_path = os.path.join(output_dir, "scan_report.pdf")
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    c.setFont("Helvetica-Bold", 14)
    c.drawString(30, height - 50, "Security Scan Report")
    c.setFont("Helvetica", 12)
    y_position = height - 80
    for _, row in df.iterrows():
        c.drawString(30, y_position, f"Issue: {row['Issue']} (Severity: {row['Severity']})")
        y_position -= 20
        c.drawString(30, y_position, f"Affected Paths: {row['Affected Paths']}")
        y_position -= 20
    c.drawImage(chart_path, 100, y_position - 150, width=300, height=200)
    c.save()
    os.remove(chart_path)
    return pdf_path

# Endpoint to save scan results
@app.post("/api/scan/save_results")
async def save_scan_results_api(request: Request):
    try:
        scan_data = await request.json()
        if not scan_data:
            return JSONResponse({"error": "Invalid JSON input"}, status_code=400)
        save_scan_results(scan_data)
        return {"message": "Scan results saved to CSV"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# Endpoint to generate and download PDF report
@app.get("/api/report/download")
async def download_report():
    pdf_file = generate_pdf_from_csv()
    if not pdf_file:
        return JSONResponse({"error": "No scan data available"}, status_code=400)
    return FileResponse(pdf_file, media_type="application/pdf", filename="scan_report.pdf")

# Emit report generation status via Socket.IO
@sio.on('generate_report')
async def handle_generate_report(sid):
    try:
        pdf_file = generate_pdf_from_csv()
        if not pdf_file:
            await sio.emit('report_status', {"status": "error", "message": "No scan data available"}, room=sid)
            return
        await sio.emit('report_status', {"status": "success", "message": "Report generated successfully", "file_path": pdf_file}, room=sid)
    except Exception as e:
        await sio.emit('report_status', {"status": "error", "message": str(e)}, room=sid)

# Existing Socket.IO events
@sio.on('scan_progress')
async def emit_scan_progress(scan_id, progress, message):
    await sio.emit('scan_progress', {'id': scan_id, 'progress': progress, 'message': message})

@sio.on('scan_complete')
async def emit_scan_complete(scan_id, results):
    await sio.emit('scan_complete', {'id': scan_id, 'results': results})

app.mount("/", socket_app)

@sio.on('connect')
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000)
