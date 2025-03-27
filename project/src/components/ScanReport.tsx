import React, { useEffect, useState } from 'react';
import { getScanResults, getScanStatus } from '../api'; // Import the new API functions
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import VulnerabilityChart from './VulnerabilityChart';
import RadarChart from './RadarChart';
import TimelineChart from './TimelineChart';

SyntaxHighlighter.registerLanguage('json', json);

interface ScanReportProps {
  results: any;
}

export default function ScanReport({ scanId }: { scanId: string | undefined }) {
    const [results, setResults] = useState<any>(null); // State to hold scan results

    useEffect(() => {
        const fetchResults = async () => {
            if (!scanId) {
                console.error("Scan ID is undefined");
                return;
            }
            const scanResults = await getScanResults(scanId); // Fetch scan results
            if (!scanResults) {
                console.error("No results found for scan ID:", scanId);
            alert("No scan results available. Please check the scan ID and try again."); // User feedback for no results
            }
            setResults(scanResults);
        };

        fetchResults();
    }, [scanId]); // Fetch results when scanId changes

    if (!results || !results.summary) {
        return <div>No scan results available. Please try again later.</div>; // User feedback for no results
    }
  if (!results || !results.summary) {
    return <div>No scan results available.</div>; // Handle case where results are undefined
  }

  const vulnerabilities = {
    critical: results.summary.critical || 0,
    high: results.summary.high || 0,
    medium: results.summary.medium || 0,
    low: results.summary.low || 0,
  };

  // Calculate security metrics based on scan results
  const securityMetrics = {
    authentication: calculateMetric(results.results.authentication),
    authorization: calculateMetric(results.results.session_management),
    dataProtection: calculateMetric(results.results.headers),
    configuration: calculateMetric(results.results.fingerprint),
    encryption: calculateMetric(results.results.network?.ssl),
    inputValidation: calculateMetric([...results.results.xss, ...results.results.sql_injection]),
  };

  // Generate timeline events from scan progress
  const scanEvents = generateScanTimeline(results);

  return ( 
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <VulnerabilityChart vulnerabilities={vulnerabilities} />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Risk Score</h3>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-blue-600">
                  {results.summary.risk_score.toFixed(1)}
                </p>
                <p className="text-lg text-gray-500 ml-2">/10</p>
              </div>
              {getRiskLevel(results.summary.risk_score)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Domain</h3>
              <p className="text-gray-600">{results.domain}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scan Date</h3>
              <p className="text-gray-600">
                {new Date(results.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RadarChart metrics={securityMetrics} />
        <TimelineChart scanEvents={scanEvents} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Findings</h2>
        <div className="space-y-6">
          {results.results.vulnerabilities?.map((vuln: any, index: number) => (
            <div key={index} className={`border-l-4 pl-4 ${getSeverityColor(vuln.severity)}`}>
              <h3 className="text-lg font-semibold text-gray-900">{vuln.title}</h3>
              <p className="text-gray-600 mt-1">{vuln.description}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(vuln.severity)}`}>
                  {vuln.severity}
                </span>
                {vuln.cvss && (
                  <span className="text-sm text-gray-500">
                    CVSS: {vuln.cvss}
                  </span>
                )}
              </div>
              {vuln.recommendation && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Recommendation:</strong> {vuln.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>
        <div className="overflow-hidden rounded-lg">
          <SyntaxHighlighter 
            language="json" 
            style={docco}
            customStyle={{ borderRadius: '0.5rem' }}
          >
            {JSON.stringify(results.results, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

function calculateMetric(data: any): number {
  if (!data) return 0;
  if (Array.isArray(data)) {
    return Math.max(0, 10 - data.length);
  }
  return typeof data === 'object' ? 8 : 5;
}

function generateScanTimeline(results: any) {
  const events = [
    { event: 'Scan Started', progress: 0 },
    { event: 'Fingerprinting', progress: 20 },
    { event: 'Network Tests', progress: 40 },
    { event: 'Application Mapping', progress: 60 },
    { event: 'Vulnerability Scanning', progress: 80 },
    { event: 'Report Generation', progress: 100 }
  ];

  const baseTime = new Date(results.timestamp);
  return events.map((event, index) => ({
    ...event,
    timestamp: new Date(baseTime.getTime() + index * 2 * 60000).toISOString(),
  }));
}

function getRiskLevel(score: number) {
  if (score >= 8) {
    return (
      <>
        <p className="text-red-600 font-medium mt-1">Critical Risk Level</p>
      </>
    );
  } else if (score >= 6) {
    return (
      <>
        <p className="text-orange-600 font-medium mt-1">High Risk Level</p>
      </>
    );
  } else if (score >= 4) {
    return (
      <>
        <p className="text-yellow-600 font-medium mt-1">Medium Risk Level</p>
      </>
    );
  }
  return (
    <>
      <p className="text-green-600 font-medium mt-1">Low Risk Level</p>
    </>
  );
}

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical': return 'border-red-500';
    case 'high': return 'border-orange-500';
    case 'medium': return 'border-yellow-500';
    default: return 'border-green-500';
  }
}

function getSeverityBadgeColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-green-100 text-green-800';
  }
}
