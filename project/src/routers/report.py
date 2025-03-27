from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile
from fastapi.responses import FileResponse
import pdfplumber
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from src.schemas.scan import ScanResult
import json
import os

try:
    from src.utils.report_generator import ReportGenerator
except ImportError as e:
    raise ImportError(f"Failed to import ReportGenerator: {e}")

router = APIRouter()

@router.get("/generate/{scan_id}")
async def generate_report(scan_id: str, background_tasks: BackgroundTasks):
    try:
        # Get scan results
        result = await get_scan_results(scan_id)
        if not result:
            raise HTTPException(status_code=404, detail="Scan results not found")

        # Create reports directory if it doesn't exist
        os.makedirs("reports", exist_ok=True)
        report_path = f"reports/{scan_id}.pdf"

        # Generate report in background
        background_tasks.add_task(
            generate_report_pdf,
            result,
            report_path
        )

        return {
            "success": True,
            "message": "Report generation started",
            "report_path": report_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_report_pdf(scan_results: dict, output_path: str):
    """Generate PDF report using ReportGenerator."""
    try:
        generator = ReportGenerator(scan_results)
        generator.generate(output_path)
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        raise e

# Extract data from the OWASP PDF
def extract_data_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    
    # Extract Risk Levels
    risk_levels = {
        "Critical": text.count("CRITICAL"),
        "High": text.count("HIGH"),
        "Medium": text.count("MEDIUM"),
        "Low": text.count("LOW"),
        "Best Practice": text.count("BEST PRACTICE"),
        "Information": text.count("INFORMATION"),
    }
    
    return text, risk_levels

# Generate Risk Level Chart
def generate_chart(risk_levels):
    labels = list(risk_levels.keys())
    values = list(risk_levels.values())

    plt.figure(figsize=(6, 4))
    plt.bar(labels, values, color=['red', 'orange', 'yellow', 'green', 'blue', 'gray'])
    plt.xlabel("Risk Level")
    plt.ylabel("Number of Issues")
    plt.title("Vulnerabilities Breakdown")
    
    chart_path = "risk_chart.png"
    plt.savefig(chart_path)
    plt.close()
    
    return chart_path

# Generate PDF Report
def generate_pdf(summary_text, risk_levels):
    pdf_path = "OWASP_Report.pdf"
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 14)
    c.drawString(30, height - 50, "OWASP Vulnerability Report")
    
    c.setFont("Helvetica", 12)
    y_position = height - 80
    for line in summary_text.split("\n")[:15]:  # Limit summary text
        c.drawString(30, y_position, line)
        y_position -= 20

    # Insert Chart
    chart_path = generate_chart(risk_levels)
    c.drawImage(chart_path, 100, y_position - 150, width=300, height=200)
    
    c.save()
    os.remove(chart_path)
    
    return pdf_path

@router.post("/generate")
async def generate_report(file: UploadFile):
    try:
        # Save uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(await file.read())

        # Extract data and generate report
        summary_text, risk_levels = extract_data_from_pdf(temp_file_path)
        pdf_file = generate_pdf(summary_text, risk_levels)

        # Clean up temporary file
        os.remove(temp_file_path)

        return FileResponse(pdf_file, media_type="application/pdf", filename="OWASP_Report.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
