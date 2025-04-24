import api from '@/api/axios';
import { PreferenceUpdateData, ProfileUpdateData, User } from '@/interfaces/userInterface';

export const updateUserProfile = async (profileData: ProfileUpdateData): Promise<{ message: string; user: User }> => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  

  export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.put('/users/password', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };
  

  export const updateUserPreferences = async (preferenceData: PreferenceUpdateData) :Promise<{ message: string; preferences: string[] }> => {
    try {
      const response = await api.put('/users/preferences', preferenceData);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };