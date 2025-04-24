import { Types } from 'mongoose';

export interface IArticle {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  blocks: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}