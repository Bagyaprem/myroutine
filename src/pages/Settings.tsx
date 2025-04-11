
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeftIcon, MoonIcon, SunIcon, UserIcon } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const handleGoBack = () => {
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-serif font-bold">Settings</h1>
        </div>
        
        <div className="space-y-8">
          {/* User Profile Section */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              User Profile
            </h2>
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              {theme === 'dark' ? (
                <MoonIcon className="mr-2 h-5 w-5" />
              ) : (
                <SunIcon className="mr-2 h-5 w-5" />
              )}
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SunIcon className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="theme-mode">Dark Mode</Label>
                <MoonIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <Switch 
                id="theme-mode" 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light');
                  toast({
                    description: `Switched to ${checked ? 'dark' : 'light'} mode`,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
