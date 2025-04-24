import { User, FileText, LogOut, Plus, PenTool, Home, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/api/axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
type AppSidebarProps = {
  userName: string;
}

const AppSidebar = ({ userName }: AppSidebarProps) => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const user  = useSelector((state: RootState) => state.auth.user);
  return (
    <aside className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 w-64 hidden md:block">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-4 flex items-center">
          <PenTool className="h-8 w-8 text-primary" />
          <span className="ml-2 font-bold text-lg">
            Wordly
          </span>
        </div>

        {/* User Info */}
        <div className="mt-4 mb-8 px-4 flex items-center">
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
          <div className="ml-3">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">Writer</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <Link 
            to="/dashboard" 
            className={`flex items-center px-4 py-3 mb-1 hover:bg-accent/10 ${isActive('/dashboard') ? 'bg-accent/20' : ''}`}
          >
            <Home className={`h-5 w-5 ${isActive('/dashboard') ? 'text-primary' : ''}`} />
            <span className="ml-3">Home</span>
          </Link>
          
          
          <Link 
            to="/my-articles" 
            className={`flex items-center px-4 py-3 mb-1 hover:bg-accent/10 ${isActive('/my-articles') ? 'bg-accent/20' : ''}`}
          >
            <FileText className={`h-5 w-5 ${isActive('/my-articles') ? 'text-primary' : ''}`} />
            <span className="ml-3">My Articles</span>
          </Link>
          
          <Link 
            to="/create-article" 
            className={`flex items-center px-4 py-3 mb-1 hover:bg-accent/10 ${isActive('/create-article') ? 'bg-accent/20' : ''}`}
          >
            <Plus className={`h-5 w-5 ${isActive('/create-article') ? 'text-primary' : ''}`} />
            <span className="ml-3">New Post</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`flex items-center px-4 py-3 mb-1 hover:bg-accent/10 ${isActive('/profile') ? 'bg-accent/20' : ''}`}
          >
            <Settings className={`h-5 w-5 ${isActive('/profile') ? 'text-primary' : ''}`} />
            <span className="ml-3">Settings</span>
          </Link>
        </nav>

        {/* Logout at bottom */}
        <div className="mt-auto mb-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-accent/10 text-left"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;