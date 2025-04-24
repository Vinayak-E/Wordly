import bcrypt from 'bcryptjs'

export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  export async function comparePasswords(
    providedPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(providedPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new Error('Password comparison failed');
    }
  }