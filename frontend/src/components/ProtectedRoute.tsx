import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import api from "@/api/axios";
import { ScaleLoader } from "react-spinners";
import { logout, setUser } from "@/features/auth/authSlice";

const ProtectedRoute: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (isAuthenticated && user) {
        setIsLoading(false); 
        return;
      }

      try {
        const response = await api.get("/users/me");
        console.log('Verify token response:', response.data.user._id);
        if (response.data.success) {
          dispatch(
            setUser({
              firstName: response.data.user.firstName,
              lastName: response.data.user.lastName,
              email: response.data.user.email,
              phone: response.data.user.phone,
              preferences: response.data.user.preferences,
              id: response.data.user._id,
              dob:response.data.dob,
              profileImage: response.data.user.profileImage || "" 
            })
          );
        } else {
          console.log('Verify token failed: No success');
          dispatch(logout());
          navigate("/login");
        }
      } catch (error: any) {
        console.error("Token verification failed:", error.response?.data || error);
        dispatch(logout());
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [dispatch, navigate, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ScaleLoader color="rgb(37, 99, 235)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;