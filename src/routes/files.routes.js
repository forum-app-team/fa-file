import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { presign, upload } from '../controllers/files.controller.js';

const router = Router();
const uploadMw = multer({ storage: multer.memoryStorage() });

router.post('/presign', requireAuth, presign);
router.post('/upload', requireAuth, uploadMw.single('file'), upload);

export default router;