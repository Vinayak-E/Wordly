import { Router } from 'express';
import { uploadFile } from '../controllers/article.controller'
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/upload', upload.single('file'), uploadFile);

export default router;   