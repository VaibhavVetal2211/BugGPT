import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        setCurrentTask(data.message);
      });

      socket.on('scan_complete', (data) => {
        // Parse the results if they are received as a string
        const parsedResults = typeof data.results === 'string' ? JSON.parse(data.results) : data.results;
        setResults(parsedResults); // Set the parsed results
        setScanning(false);
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

  const renderResults = () => {
    if (!results) return null;

    const renderValue = (value: any) => {
      if (Array.isArray(value)) {
        return value.map((item, index) => (
          <div key={index} className="ml-4">
            - {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
          </div>
        ));
      } else if (typeof value === 'object') {
        return (
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      } else {
        return value.toString();
      }
    };

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan Results</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Domain Information</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">{key}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {renderValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    );
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
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">{currentTask}</p>
              <p className="text-sm text-gray-500">Progress: {progress}%</p>
            </div>
          </div>
        )}

        {renderResults()}
      </div>
    </div>
  );
}

export default ScanDomain;
