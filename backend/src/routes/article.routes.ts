import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  blockArticle,
  createArticle,
  getArticles,
  getUserArticles,
  updateArticle,
  deleteArticle,
  likeArticle,
  dislikeArticle,
  getArticleById,
} from "../controllers/article.controller";

const router = Router();

router.post("/", authMiddleware, createArticle);
router.get("/", authMiddleware, getArticles);
router.get("/my-articles", authMiddleware, getUserArticles);
router.get('/:id',     authMiddleware, getArticleById);
router.put("/:id", authMiddleware, updateArticle);
router.delete("/:id", authMiddleware, deleteArticle);
router.post("/:id/like", authMiddleware, likeArticle);
router.post("/:id/dislike", authMiddleware, dislikeArticle);
router.post("/:id/block", authMiddleware, blockArticle);

export default router;
