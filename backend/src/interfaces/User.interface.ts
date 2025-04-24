import { Types } from 'mongoose';

export interface IUser {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: Date;
  password: string;
  preferences: Types.ObjectId[];
  createdAt: Date;
  profileImage?:string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  password: string;
  preferences: string[];
  otp: string;
}

