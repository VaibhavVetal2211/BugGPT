import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { logger } from '../utils/logger.js';

export async function setupDatabase() {
try {
    const db = await open({
        filename: 'bug_gpt.db', // Use consistent naming
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            domain TEXT NOT NULL,
            status TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS scan_results (
            scan_id TEXT PRIMARY KEY,
            results TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (scan_id) REFERENCES scans(id)
        );
    `);

    return db;
} catch (error) {
    if (error.code === 'SQLITE_ERROR') {
        logger.error('SQLite error during database setup:', error);
    } else {
        logger.error('Unexpected error during database setup:', error);
    }
    throw error;
}
