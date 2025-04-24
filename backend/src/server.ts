import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import articleRoutes from './routes/article.routes';
import categoryRoutes from './routes/category.routes'
import connectDB from './config/db';
import uploadRoutes from './routes/upload.routes';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://wordly-sand.vercel.app/'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/articles', articleRoutes);
app.use('/categories', categoryRoutes);
app.use('/api',uploadRoutes)
const startServer = async (): Promise<void> => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  };
  
  startServer();