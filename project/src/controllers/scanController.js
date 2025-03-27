import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { Scanner } from '../services/scanner.js';
import { db } from '../database/db.js';

export const startScan = async (req, res) => {
  try {
    const { domain } = req.body;
    const scanId = uuidv4();
    
    // Create scan record
    await db.run(
      'INSERT INTO scans (id, domain, status, created_at) VALUES (?, ?, ?, ?)',
      [scanId, domain, 'pending', new Date().toISOString()]
    );

    // Start scan process
    const scanner = new Scanner(domain, scanId);
    scanner.start();

    res.status(200).json({
      success: true,
      scanId,
      message: 'Scan started successfully'
    });
  } catch (error) {
    logger.error('Error starting scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start scan'
    });
  }
};

export const getScanStatus = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scan = await db.get(
      'SELECT status, progress FROM scans WHERE id = ?',
      [scanId]
    );

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.status(200).json({
      success: true,
      status: scan.status,
      progress: scan.progress
    });
  } catch (error) {
    logger.error('Error getting scan status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scan status'
    });
  }
};

export const getScanResults = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const results = await db.get(
      'SELECT * FROM scan_results WHERE scan_id = ?',
      [scanId]
    );

    if (!results) {
      return res.status(404).json({
        success: false,
        error: 'Scan results not found'
      });
    }

    // Deserialize results from JSON
    const deserializedResults = JSON.parse(results.results);

    res.status(200).json({
      success: true,
      results: deserializedResults
    });
  } catch (error) {
    logger.error('Error getting scan results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scan results'
    });
  }
};
