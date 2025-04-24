export interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    profileImage?:string;
  }

export  interface Category {
    _id: string;
    name: string;
    description?: string;
  }
  
  
  
  export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  export interface User {
    _id?: string;
    id:string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    preferences: string[] ;
    createdAt?: string;
    updatedAt?: string;
    profileImage?:string;
  }
  
 export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dob?: string;
    profileImage?:string;
  }


  export interface PreferenceUpdateData {
    preferences: string[];
  }
  