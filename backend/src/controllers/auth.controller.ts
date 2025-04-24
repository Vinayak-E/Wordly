import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { sendResetEmail } from '../utils/email';
import { setRedisData, getRedisData } from '../utils/redis';


import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { comparePasswords, generateOTP } from '../helpers/helperFuntions';
import { RegisterData } from '../interfaces/User.interface';
import redisClient from '../config/redis';



export const register = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, phone, email, dob, password, confirmPassword, preferences } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      res.status(400).json({ message: 'Email or phone already exists' });
      return;
    }

    const otp = generateOTP();
    console.log('otp',otp);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const redisKey = `user:register:${email}`;
    const registerData: RegisterData = {
      firstName,
      lastName,
      phone,
      email,
      dob,
      password: hashedPassword,
      preferences,
      otp,
    };

    await setRedisData(redisKey, registerData, 600); // 10 minutes expiry

    const html = `
      <p>Your OTP for email verification is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendResetEmail(email, 'Email Verification OTP', html);

    res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
console.log("req",req.body);

  try {
    const redisKey = `user:register:${email}`;
    const userData = await getRedisData(redisKey);

    if (!userData) {
      res.status(400).json({ message: 'OTP expired or invalid' });
      return;
    }

    const parsedData: RegisterData = JSON.parse(userData);

    if (parsedData.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    const user = new User({
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      phone: parsedData.phone,
      email: parsedData.email,
      dob: new Date(parsedData.dob),
      password: parsedData.password,
      preferences: parsedData.preferences,
      
    });

    let result  = await user.save();
    console.log('result',result);
    
    await redisClient.del(redisKey);

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
        dob:user.dob,
        profileImage: user.profileImage || ""
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
console.log("req.body at resendotp",req.body);

  try {
    const redisKey = `user:register:${email}`;
    const userData = await getRedisData(redisKey);

    if (!userData) {
      res.status(400).json({ message: 'OTP expired or invalid' });
      return;
    }

    const parsedData: RegisterData = JSON.parse(userData);
    const newOtp = generateOTP();
    parsedData.otp = newOtp;

    await setRedisData(redisKey, parsedData, 600); // 10 minutes expiry

    const html = `
      <p>Your new OTP for email verification is: <strong>${newOtp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendResetEmail(email, 'Resend OTP', html);

    res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await comparePasswords(password, user.password))) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
        dob:user.dob,
        profileImage: user.profileImage || ""
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
   console.log('refresh token called')
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
      }
  
      const newAccessToken = generateAccessToken(user._id.toString());
      const newRefreshToken = generateRefreshToken(user._id.toString());
  
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none', 
        maxAge: 15 * 60 * 1000,
      });
  
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
      });
         console.log('new refresh token updated')
      res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  };


  export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out sucessfully',
      });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
  };