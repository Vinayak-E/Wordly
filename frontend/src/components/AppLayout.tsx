import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { User, Settings, FileText, LogOut, PenTool, Home, Plus } from 'lucide-react';
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppSidebar from './AppSidebar';
import api from '@/api/axios';
import { logout } from '@/features/auth/authSlice';
import { useDispatch } from "react-redux";
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
const AppLayout = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [userName, setUserName] = useState('User');
  
  const user  = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    fetchUserInfo();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/users/me');
      console.log('response at sidebar',response)
      setUserName(response.data.user.firstName || 'User');
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      
      <AppSidebar userName={userName} />

      <div className="flex-1 md:ml-64">
    
        <header className={`fixed right-0 left-0 md:left-64 transition-all duration-300 border-b dark:border-0 z-40 ${
            scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-background/70 backdrop-blur-sm"
          }`}>
         <div className="px-6 py-4 flex justify-end items-center">
            {/* Logo for Mobile */}
            <div className="md:hidden flex items-center mr-auto">
              <PenTool className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-lg">Wordly</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <div>
                <ModeToggle />
              </div>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent/20"
                  >
                    {user?.profileImage ? (
      <img
        src={user.profileImage}
        alt="Profile"
        className="h-8 w-8 rounded-full object-cover"
      />
    ) : (
      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
        <User className="h-5 w-5" />
      </div>
    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">Writer</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-articles" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Articles</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/create-article" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Post</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content with Outlet */}
        <main className="px-6 lg:px-8 py-8 pt-28">
          <Outlet />
        </main>
      </div>

      {/* Mobile-only create button */}
      <Button
        className="md:hidden fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        size="icon"
        asChild
      >
        <Link to="/create-article">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
};

export default AppLayout;