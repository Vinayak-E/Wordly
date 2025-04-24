import { Request, Response } from 'express';
import Article from '../models/Article';
import { AuthRequest } from '../middleware/authMiddleware';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; 

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      res.status(400).json({ message: 'Invalid file type. Only image files (JPEG, PNG, GIF, WebP, BMP) are allowed.' });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ message: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.` });
      return;
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME is not defined in environment variables');
    }

    const fileName = `${uuidv4()}-${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(uploadParams).promise();
    res.json({ url: data.Location });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, images, tags, category } = req.body;
  try {
    const article = new Article({
      title,
      description,
      images: images || [], 
      tags,
      category,
      author: req.user._id,
    });
    await article.save();
    res.status(201).json({ message: 'Article created', article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const userId = req.user._id;
    const userPreferences = req.user.preferences || []; 

  
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
      blocks: { $nin: [userId] },
      category: { $in: userPreferences.length > 0 ? userPreferences : await Article.distinct('category') },
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }


    const articles = await Article.find(query)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name')
      .populate('author', 'firstName lastName')
      .lean(); 


    const totalArticles = await Article.countDocuments(query);

    res.json({
      articles,
      total: totalArticles,
      page: pageNum,
      limit: limitNum,
      hasMore: skip + articles.length < totalArticles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


export const getUserArticles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const userId = req.user._id;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;


    const query: any = {
      author: userId, 
    };


    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await Article.find(query)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name')
      .populate('author', 'firstName lastName')
      .populate('likes', 'firstName lastName')
      .populate('blocks', 'firstName lastName')
      .lean(); 

    const totalArticles = await Article.countDocuments(query);

    res.json({
      articles,
      total: totalArticles,
      page: pageNum,
      limit: limitNum,
      hasMore: skip + articles.length < totalArticles,
    });
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, images, tags, category } = req.body;

  try {
    const article = await Article.findOne({ _id: id, author: req.user._id });
    if (!article) {
      res.status(404).json({ message: 'Article not found or unauthorized' });
      return;
    }

    article.title = title || article.title;
    article.description = description || article.description;
    article.images = images || article.images; 
    article.tags = tags || article.tags;
    article.category = category || article.category;
    article.updatedAt = new Date();

    await article.save();
    res.json({ message: 'Article updated', article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await Article.findOneAndDelete({ _id: id, author: req.user._id });
    if (!article) {
      res.status(404).json({ message: 'Article not found or unauthorized' });
      return;
    }
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const likeArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    if (article.likes.includes(req.user._id)) {
      res.status(400).json({ message: 'Article already liked' });
      return;
    }

    article.likes.push(req.user._id);
    article.dislikes = article.dislikes.filter((userId) => userId.toString() !== req.user._id.toString());
    await article.save();
    res.json({ message: 'Article liked', article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const dislikeArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    if (article.dislikes.includes(req.user._id)) {
      res.status(400).json({ message: 'Article already disliked' });
      return;
    }

    article.dislikes.push(req.user._id);
    article.likes = article.likes.filter((userId) => userId.toString() !== req.user._id.toString());
    await article.save();
    res.json({ message: 'Article disliked', article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const blockArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    if (article.blocks.includes(req.user._id)) {
      res.status(400).json({ message: 'Article already blocked' });
      return;
    }

    article.blocks.push(req.user._id);
    await article.save();
    res.json({ message: 'Article blocked', article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getArticleById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const article = await Article.findById(id)
        .populate('category')
        .populate('author', 'firstName lastName');
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }
   
      res.json(article);
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  };