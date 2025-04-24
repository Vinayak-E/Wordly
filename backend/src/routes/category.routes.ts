import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/category.controller';


const router = Router();

router.get('/', getCategories);
router.post('/', createCategory);

export default router;