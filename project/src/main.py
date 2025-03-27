import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
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
        
        # Write header only if the file doesn't exist
        if not file_exists:
            writer.writerow(["Issue", "Category", "Details", "Scan Date"])
        
        # Extract vulnerabilities
        vulnerabilities = scan_data.get("vulnerabilities", [])
        for vulnerability in vulnerabilities:
            writer.writerow([vulnerability, "Vulnerability", "N/A", datetime.datetime.now().isoformat()])
        
        # Extract security misconfigurations
        misconfigs = scan_data.get("security_misconfigs", [])
        for misconfig in misconfigs:
            writer.writerow([misconfig, "Misconfiguration", "N/A", datetime.datetime.now().isoformat()])
            
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

    # Create a temporary directory for the output
    output_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(output_dir, "scan_report.pdf")
    
    # Initialize the PDF canvas
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    # Add title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(30, height - 50, "Security Scan Report")
    c.setFont("Helvetica", 12)
    c.drawString(30, height - 70, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    y_position = height - 100

    # Add vulnerabilities section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(30, y_position, "Vulnerabilities:")
    y_position -= 20
    c.setFont("Helvetica", 12)
    vulnerabilities = df[df["Category"] == "Vulnerability"]
    if not vulnerabilities.empty:
        for _, row in vulnerabilities.iterrows():
            c.drawString(30, y_position, f"- {row['Issue']} (Details: {row['Details']})")
            y_position -= 20
            if y_position < 50:  # Start a new page if space runs out
                c.showPage()
                y_position = height - 50
    else:
        c.drawString(30, y_position, "No vulnerabilities found.")
        y_position -= 20

    # Add misconfigurations section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(30, y_position, "Security Misconfigurations:")
    y_position -= 20
    c.setFont("Helvetica", 12)
    misconfigs = df[df["Category"] == "Misconfiguration"]
    if not misconfigs.empty:
        for _, row in misconfigs.iterrows():
            c.drawString(30, y_position, f"- {row['Issue']} (Details: {row['Details']})")
            y_position -= 20
            if y_position < 50:  # Start a new page if space runs out
                c.showPage()
                y_position = height - 50
    else:
        c.drawString(30, y_position, "No misconfigurations found.")
        y_position -= 20

    # Save the PDF
    c.save()

    return pdf_path

# Endpoint to save scan results:
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
    """Emit scan progress updates."""
    print(f"📡 Emitting scan progress: {scan_id} - {progress}% - {message}")
    await sio.emit('scan_progress', {'id': scan_id, 'progress': progress, 'message': message})

@sio.on('scan_complete')
async def emit_scan_complete(scan_id, results):
    """Emit scan completion notifications."""
    try:
        # Convert datetime objects to ISO format
        def serialize(obj):
            if isinstance(obj, datetime.datetime):
                return obj.isoformat()
            elif isinstance(obj, list):
                return [serialize(item) for item in obj]
            elif isinstance(obj, dict):
                return {key: serialize(value) for key, value in obj.items()}
            return obj

        serialized_results = serialize(results)
        print(f"🎯 Scan complete for {scan_id}. Sending results: {serialized_results}")
        await sio.emit('scan_complete', {'id': scan_id, 'results': serialized_results})
    except Exception as e:
        print(f"Error serializing scan results: {e}")

# Add a new function to trigger scan completion and emit results
async def trigger_scan_complete(scan_id, results):
    """Trigger scan completion and notify frontend."""
    print(f"🔔 Triggering scan complete for {scan_id} with results.")
    serialized_results = serialize(results)
    print(f"🎯 Scan complete for {scan_id}. Sending results: {serialized_results}")
    await sio.emit('scan_complete', {'id': scan_id, 'results': serialized_results})

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
