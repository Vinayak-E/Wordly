import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.accessToken;

  if (!token) {
    console.log('No acces token found')
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.log('Access token expired');
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;