import express from 'express';
import { startScan, getScanStatus, getScanResults } from '../controllers/scanController.js';
import { validateScanRequest } from '../middleware/validators.js';

const router = express.Router();

router.post('/start', validateScanRequest, startScan);
router.get('/status/:scanId', getScanStatus);
router.get('/results/:scanId', getScanResults);

export { router as scanRouter };