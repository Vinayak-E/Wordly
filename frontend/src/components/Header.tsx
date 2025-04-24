import { useState } from 'react';
import { PenTool, User, FileText, Settings, LogOut } from 'lucide-react';
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLogout?: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const handleLogout = () => {
    if (onLogout) onLogout();
    setDropdownOpen(false);
  };

  return (
    <header className="fixed w-full transition-all duration-300 border-b dark:border-0 z-50 $
      bg-background/70 backdrop-blur-sm"
    >
      <div className="container mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold flex items-center">
            <PenTool className="h-8 w-8 mr-2" />
            Wordly
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="mr-3">
            <ModeToggle />
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="rounded-full hover:bg-accent/20"
            >
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 ring-1 ring-border">
        
                <a href="/my-articles" className="px-4 py-2 text-sm hover:bg-accent/10 flex items-center">
                  <FileText className="mr-2 h-4 w-4" /> My Articles
                </a>
                <a href="/profile" className="px-4 py-2 text-sm hover:bg-accent/10 flex items-center">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </a>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent/10 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;