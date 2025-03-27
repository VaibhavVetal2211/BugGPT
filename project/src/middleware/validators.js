import { z } from 'zod';

const scanRequestSchema = z.object({
  domain: z.string().min(1).max(255).regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
});

export const validateScanRequest = (req, res, next) => {
  try {
    scanRequestSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid domain format. Please ensure it follows the correct structure (e.g., example.com)'
    });
  }
};
