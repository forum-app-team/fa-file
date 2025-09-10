import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { PresignSchema } from '../validators/files.schema.js';
import { presign, upload, retrieve } from '../controllers/files.controller.js';

const router = Router();
const uploadMw = multer({ storage: multer.memoryStorage() });

router.post('/presign', requireAuth, rateLimit(), validate(PresignSchema), presign);
router.post('/upload', requireAuth, rateLimit(), uploadMw.single('file'), upload);
router.get('/retrieve/:objectKey(*)', requireAuth, rateLimit(), retrieve);

export default router;

