
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { JournalProvider } from '@/contexts/JournalContext';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show nothing while checking authentication
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If authenticated, show the app
  return (
    <JournalProvider>
      <Layout />
    </JournalProvider>
  );
};

export default Index;
