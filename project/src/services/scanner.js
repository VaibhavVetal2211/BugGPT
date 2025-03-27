import puppeteer from 'puppeteer';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { db } from '../database/db.js';

export class Scanner {
  constructor(domain, scanId) {
    this.domain = domain;
    this.scanId = scanId;
    this.results = {
      fingerprint: null,
      network: null,
      vulnerabilities: [],
      components: [],
      sessionManagement: null,
      authentication: null,
      errorCodes: [],
      xss: [],
      sqlInjection: [],
      csrf: null,
      headers: null
    };
  }

  async start() {
    try {
      await this.updateStatus('scanning');
      
      // Run scans in parallel
      await Promise.all([
        this.fingerprint(),
        this.networkTest(),
        this.applicationMapping(),
        this.vulnerabilityScan(),
        this.componentAudit(),
        this.sessionManagementAudit(),
        this.authenticationAudit(),
        this.errorCodeTest(),
        this.securityHeadersCheck()
      ]);

      await this.generateReport();
      await this.updateStatus('completed');
    } catch (error) {
      logger.error('Scan error:', error);
      await this.updateStatus('failed');
    }
  }

  async updateStatus(status, progress = 0) {
    await db.run(
      'UPDATE scans SET status = ?, progress = ?, updated_at = ? WHERE id = ?',
      [status, progress, new Date().toISOString(), this.scanId]
    );
  }

  async fingerprint() {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(`https://${this.domain}`);

      // Get technologies
      const technologies = await page.evaluate(() => {
        return window.Wappalyzer ? window.Wappalyzer.technologies : [];
      });

      this.results.fingerprint = {
        technologies,
        headers: await page.evaluate(() => {
          return Object.fromEntries(
            Object.entries(window.performance.getEntriesByType('resource')[0].responseHeaders || {})
          );
        })
      };

      await browser.close();
    } catch (error) {
      logger.error('Fingerprinting error:', error);
      this.results.fingerprint = { error: error.message };
    }
  }

  async networkTest() {
    try {
      const response = await axios.get(`https://${this.domain}`);
      this.results.network = {
        status: response.status,
        headers: response.headers,
        ssl: await this.sslCheck()
      };
    } catch (error) {
      logger.error('Network test error:', error);
      this.results.network = { error: error.message };
    }
  }

  async generateReport() {
    try {
      const report = {
        scanId: this.scanId,
        domain: this.domain,
        timestamp: new Date().toISOString(),
        results: this.results,
        summary: this.generateSummary()
      };

      await db.run(
        'INSERT INTO scan_results (scan_id, results, created_at) VALUES (?, ?, ?)',
        [this.scanId, JSON.stringify(report), new Date().toISOString()]
      );
    } catch (error) {
      logger.error('Report generation error:', error);
      throw error;
    }
  }

  generateSummary() {
    const vulnerabilities = this.results.vulnerabilities.length;
    const critical = this.results.vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = this.results.vulnerabilities.filter(v => v.severity === 'high').length;
    const medium = this.results.vulnerabilities.filter(v => v.severity === 'medium').length;
    const low = this.results.vulnerabilities.filter(v => v.severity === 'low').length;

    return {
      total: vulnerabilities,
      critical,
      high,
      medium,
      low,
      riskScore: this.calculateRiskScore({ critical, high, medium, low })
    };
  }

  calculateRiskScore({ critical, high, medium, low }) {
    return (critical * 10 + high * 7 + medium * 4 + low * 1) / 10;
  }
}