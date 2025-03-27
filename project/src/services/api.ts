import axios from 'axios';
import { logger } from '../utils/logger'; // Adjust the import path as necessary

const API_URL = 'http://localhost:8000/api';

export const api = {
  startScan: async (domain: string) => {
    let response;
    try {
         response = await axios.post(`${API_URL}/scan/start`, { domain });
    } catch (error) {
        logger.error('Error starting scan: ' + error.message);
        throw new Error('Failed to start scan');
    }
    return response.data;
  },

  getScanStatus: async (scanId: string) => {
    let response;
    try {
         response = await axios.get(`${API_URL}/scan/status/${scanId}`);
    } catch (error) {
        logger.error('Error getting scan status: ' + error.message);
        throw new Error('Failed to get scan status');
    }
    return response.data;
  },

  getScanResults: async (scanId: string) => {
    let response;
    try {
         response = await axios.get(`${API_URL}/scan/results/${scanId}`);
    } catch (error) {
        logger.error('Error getting scan results: ' + error.message);
        throw new Error('Failed to get scan results');
    }
    return response.data;
  },

  generateReport: async (scanId: string) => {
    let response;
    try {
         response = await axios.get(`${API_URL}/report/generate/${scanId}`);
    } catch (error) {
        logger.error('Error generating report: ' + error.message);
        throw new Error('Failed to generate report');
    }
    return response.data;
  }
};
