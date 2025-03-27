import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client'; // Import Socket.IO client
import { Link } from 'react-router-dom';
import SecurityScore from '../components/SecurityScore';
import ThreatMap from '../components/ThreatMap';
import NetworkMap from '../components/NetworkMap';
import VulnerabilityTimeline from '../components/VulnerabilityTimeline';
import { api } from '../services/api';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [securityData, setSecurityData] = useState<any>(null);

  useEffect(() => {
    const socket = io('http://localhost:8000'); // Initialize Socket.IO client

    socket.on('scan_complete', (data) => {
      setSecurityData(data.results); // Update state with scan results
      setLoading(false); // Set loading to false
    });

    // Fetch initial data from the API if needed
    const fetchData = async () => {
      try {
        const scanId = "your_scan_id_here"; // Define scanId variable
    const response = await api.getScanResults(scanId); // Fetch scan results using the correct API method
    console.error('Error fetching scan results:', error); // Log the error for better diagnostics
        setSecurityData(response.data);
      } catch (error) {
        setError('Failed to fetch data: ' + error.message); // Include error message in the state
        setLoading(false);
      }
    };

    fetchData(); // Call the function to fetch data

    return () => {
      socket.disconnect(); // Clean up the socket connection on unmount
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Security Dashboard
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Real-time security monitoring and vulnerability assessment
          </p>
          <div className="mt-8">
            <Link
              to="/scan"
              className="inline-block bg-blue-600 px-8 py-3 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Scan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <SecurityScore
            score={securityData.securityScore.score}
            maxScore={securityData.securityScore.maxScore}
          />
          <ThreatMap threats={securityData.threats} />
        </div>

        <div className="mt-8">
          <NetworkMap
            nodes={securityData.network.nodes}
            links={securityData.network.links}
          />
        </div>

        <div className="mt-8">
          <VulnerabilityTimeline data={securityData.timeline} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">example{i}.com</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vulnerabilities</h3>
            <div className="space-y-4">
              {securityData.threats.slice(0, 3).map((threat: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{threat.category}</p>
                    <p className="text-xs text-gray-500">{threat.count} instances</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      threat.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : threat.severity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : threat.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {threat.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  Keep your software components up to date
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  Implement strong authentication mechanisms
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  Regularly backup your critical data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
