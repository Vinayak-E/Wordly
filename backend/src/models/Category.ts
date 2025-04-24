import mongoose, { Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/Category.interface';

const categorySchema: Schema<ICategory> = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<ICategory>('Category', categorySchema);