import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ReportTable from "../components/ReportTable";
import ReportSummary from "../components/ReportSummary";
import ReportPieCharts from "../components/ReportPieChart";
import { ScanResult } from "../constants";

function ScanDomain() {
  const [domain, setDomain] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [results, setResults] = useState<any | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanDate, setScanDate] = useState<string | null>(null);

  // Refs for capturing charts and the entire report
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanId) {
      const socket = io("http://localhost:8000");

      socket.on("connect", () => {
        socket.emit("join_scan", scanId);
      });

      socket.on("scan_progress", (data) => {
        setProgress(data.progress);
        setCurrentTask(data.message);
      });

      socket.on("scan_complete", (data: ScanResult) => {
        const parsedResults =
          typeof data.results === "string"
            ? JSON.parse(data.results)
            : data.results;
        setResults(parsedResults);
        setScanning(false);
        setScanCompleted(true);
        setScanDate(new Date().toLocaleString());
        console.log(data.results.vulnerabilities);
        console.log(data.results.security_misconfigs);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [scanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setScanning(true);
    setResults(null);
    setProgress(0);
    setCurrentTask("Initializing scan...");
    setScanCompleted(false);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/scan/start",
        { domain }
      );
      setScanId(response.data.scan_id);
    } catch (err) {
      setError("Failed to start scan. Please try again.");
      setScanning(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      try {
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = imgWidth / pdfWidth;
        const scaledHeight = imgHeight / ratio;

        let y = 0;

        while (y < imgHeight) {
          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d");

          pageCanvas.width = imgWidth;
          pageCanvas.height = Math.min(imgHeight - y, pdfHeight * ratio);

          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, -y, imgWidth, imgHeight);
          }

          const pageData = pageCanvas.toDataURL("image/png");
          pdf.addImage(
            pageData,
            "PNG",
            0,
            0,
            pdfWidth,
            pageCanvas.height / ratio
          );

          y += pdfHeight * ratio;
          if (y < imgHeight) {
            pdf.addPage();
          }
        }

        pdf.save(`Domain_Security_Report_${domain}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    } else if (typeof value === "object" && value !== null) {
      return <code>{JSON.stringify(value, null, 2)}</code>;
    } else {
      return value || "N/A";
    }
  };

  const renderDomainInfo = () => {
    if (!scanCompleted || !domain) {
      return null;
    }

    const logoUrl = `https://logo.clearbit.com/${domain}`;

    return (
      <div className="text-center mt-8">
        <img
          src={logoUrl}
          alt={`${domain} logo`}
          className="mx-auto mb-4 w-24 h-24 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <a
          href={`https://${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 transition-colors"
        >
          Visit {domain}
        </a>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Domain Security Scanner
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 my-9">
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700"
            >
              Domain Name
            </label>
            <input
              type="text"
              name="domain"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="example.com"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={scanning}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {scanning ? "Scanning..." : "Start Scan"}
          </button>
        </form>

        {scanning && (
          <div className="mt-8 rounded-xl bg-white p-4 shadow">
            <p className="text-gray-700 font-medium">{currentTask}</p>

            <div className="w-full bg-gray-200 rounded-full h-4 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-500 mt-2">Progress: {progress}%</p>
          </div>
        )}

        {/* Printable Section */}
        <div ref={reportRef} className="bg-white p-8 shadow-lg rounded-xl">
          {scanDate && (
            <div className="text-right text-sm font-bold mb-4">
              Scan Date: {scanDate}
            </div>
          )}
          {renderDomainInfo()}
          <ReportPieCharts
            misconfigs={results?.security_misconfigs}
            vulnerabilities={results?.vulnerabilities}
          />
          <ReportTable scanCompleted={scanCompleted} results={results} />
          <ReportSummary scanCompleted={scanCompleted} results={results} />

          {/* Footer Section inside Printable Section */}
          {scanCompleted && (
            <footer className="bg-gray-800 text-white py-4 mt-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm">
                  © 2025 Astraeus Next Gen. All rights reserved.
                </p>
              </div>
            </footer>
          )}
        </div>

        {scanCompleted && (
          <div className="mt-8 text-center">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Download Report as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanDomain;
