import { User } from '@/interfaces/userInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      setUser: (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      },
  
      logout: (state) => {
        state.user = null;
        state.isAuthenticated = false;
      },
    },
  });
  
  export const { setUser, logout } = authSlice.actions;
  export default authSlice.reducer;