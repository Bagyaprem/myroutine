
import React from 'react';
import { Button } from "@/components/ui/button";
import { PenIcon, CalendarIcon, MessageCircleIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { formatDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeTab: 'journal' | 'calendar' | 'assistant';
  setActiveTab: (tab: 'journal' | 'calendar' | 'assistant') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <header className="border-b border-border py-4 px-6 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mr-2">
            DailyNest
          </h1>
          <div className="hidden md:block text-sm text-muted-foreground">
            {formatDate(new Date())}
          </div>
        </div>
        
        <nav className="flex space-x-1">
          <Button 
            variant={activeTab === 'journal' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('journal')}
            className="rounded-lg"
            size="sm"
          >
            <PenIcon className="h-4 w-4 mr-2" />
            Journal
          </Button>
          <Button 
            variant={activeTab === 'calendar' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('calendar')}
            className="rounded-lg"
            size="sm"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button 
            variant={activeTab === 'assistant' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('assistant')}
            className="rounded-lg"
            size="sm"
          >
            <MessageCircleIcon className="h-4 w-4 mr-2" />
            Assistant
          </Button>
        </nav>
        
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSettingsClick} className="text-muted-foreground">
                <SettingsIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSignIn}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
