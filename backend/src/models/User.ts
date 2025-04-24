import mongoose, { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/User.interface';
import bcrypt from 'bcryptjs';

const userSchema: Schema<IUser> = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true  },
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  profileImage :{type:String,},
  preferences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  createdAt: { type: Date, default: Date.now },
});


export default model<IUser>('User', userSchema);