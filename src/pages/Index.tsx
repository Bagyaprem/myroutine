
import React from 'react';
import Layout from '@/components/Layout';
import { JournalProvider } from '@/contexts/JournalContext';

const Index = () => {
  return (
    <JournalProvider>
      <Layout />
    </JournalProvider>
  );
};

export default Index;
