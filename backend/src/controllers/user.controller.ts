import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';


export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const { firstName, lastName, phone, email, dob, password, profileImage } = req.body;
  
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phone = phone || user.phone;
      user.email = email || user.email;
      user.dob = dob || user.dob;
      if (profileImage) user.profileImage = profileImage;
      if (password) user.password = password;
  
      await user.save();
      res.json({ 
        message: 'Profile updated', 
        user: { 
          id: user._id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          phone: user.phone, 
          preferences: user.preferences,
          profileImage: user.profileImage,
          dob: user.dob
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  const { preferences } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.preferences = preferences;
    await user.save();
    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user._id).select('-password'); 
      if (!user) {
     
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.status(200).json({success:true,user});
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user._id);
    
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };