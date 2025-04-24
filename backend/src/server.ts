import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { RedisStore } from 'connect-redis'; 
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import articleRoutes from './routes/article.routes';
import categoryRoutes from './routes/category.routes';
import uploadRoutes from './routes/upload.routes';
import connectDB from './config/db';
import  redisClient, { initRedis } from './config/redis';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://wordly-sand.vercel.app'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient, ttl: 86400 }),     
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 86400000, 
    },
  })
);

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/articles', articleRoutes);
app.use('/categories', categoryRoutes);
app.use('/api', uploadRoutes);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    await initRedis();
    console.log('Connected to Redis');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();