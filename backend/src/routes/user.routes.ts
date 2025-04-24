import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { getCurrentUser, updatePassword, updatePreferences, updateProfile } from '../controllers/user.controller';

const router = Router();
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);
router.put('/preferences', authMiddleware, updatePreferences);
router.put('/password', authMiddleware,updatePassword);

export default router;