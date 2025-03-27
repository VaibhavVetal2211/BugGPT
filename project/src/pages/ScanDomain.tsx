import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ScanProgress from '../components/ScanProgress';
import ScanReport from '../components/ScanReport';
import { io } from 'socket.io-client';

function ScanDomain() {
  const [domain, setDomain] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [results, setResults] = useState<any | null>(null);

  useEffect(() => {
    if (scanId) {
      const socket = io('http://localhost:8000');
      
      socket.on('connect', () => {
        socket.emit('join_scan', scanId);
      });

      socket.on('scan_progress', (data) => {
        setProgress(data.progress);
        setCurrentTask(data.message); // Updated to use "message" from the backend
      });

      socket.on('scan_complete', async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/scan/results/${scanId}`);
          setResults(response.data.results); // Ensure "results" is correctly accessed
          setScanning(false);
        } catch (err) {
          console.error('Error fetching scan results:', err); // Log the error for debugging
          setError('Failed to fetch scan results.');
          setScanning(false);
        }
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
    setCurrentTask('Initializing scan...');

    try {
      const response = await axios.post('http://localhost:8000/api/scan/start', { domain });
      setScanId(response.data.scan_id);
    } catch (err) {
      setError('Failed to start scan. Please try again.');
      setScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Domain Security Scanner
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
              Domain Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="domain"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="example.com"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={scanning}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                scanning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {scanning ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </form>

        {scanning && (
          <div className="mt-8">
            <ScanProgress progress={progress} currentTask={currentTask} />
          </div>
        )}

        {results && (
          <div className="mt-8">
            <ScanReport results={results} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanDomain;
