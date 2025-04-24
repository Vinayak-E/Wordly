import api from "@/api/axios";
import { LoginFormData } from "@/validations/loginSchema";
import { RegisterFormData } from "@/validations/registerSchema";

export const registerUser = async (data: RegisterFormData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};
export const loginUser = async (data: LoginFormData) => {
    const response = await api.post(`/auth/login`, data);
    return response.data;
  };

 
export const verifyOtp = async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  };
  
  export const resendOtp = async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  };

  export const getCategories =async()=>{
    const response = await api.get('/categories')
    return response.data
  }

  