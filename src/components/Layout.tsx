
import React, { useState } from 'react';
import Header from './Header';
import JournalEditor from './JournalEditor';
import CalendarView from './CalendarView';
import AIAssistant from './AIAssistant';
import { useJournal } from '@/contexts/JournalContext';
import EntryCard from './EntryCard';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'calendar' | 'assistant'>('journal');
  const { entries, currentEntry, setCurrentEntry } = useJournal();
  const [isNewEntry, setIsNewEntry] = useState(false);
  
  const handleCreateNewEntry = () => {
    setCurrentEntry(null);
    setIsNewEntry(true);
    setActiveTab('journal');
  };
  
  const handleViewEntry = (entry: typeof entries[0]) => {
    setCurrentEntry(entry);
    setIsNewEntry(false);
    setActiveTab('journal');
  };
  
  const handleCloseEditor = () => {
    setCurrentEntry(null);
    setIsNewEntry(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="journal-container">
          {activeTab === 'journal' && (
            <>
              {isNewEntry || currentEntry ? (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="absolute -top-2 -left-2 mb-4"
                    onClick={handleCloseEditor}
                  >
                    ← Back
                  </Button>
                  <div className="pt-10">
                    <JournalEditor 
                      isNew={isNewEntry} 
                      onSave={handleCloseEditor} 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-medium">Journal Entries</h2>
                    <Button onClick={handleCreateNewEntry}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      New Entry
                    </Button>
                  </div>
                  
                  {entries.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start writing your thoughts and reflections
                      </p>
                      <Button onClick={handleCreateNewEntry}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create your first entry
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entries.map(entry => (
                        <EntryCard 
                          key={entry.id} 
                          entry={entry} 
                          onClick={() => handleViewEntry(entry)} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
          
          {activeTab === 'calendar' && <CalendarView />}
          
          {activeTab === 'assistant' && <AIAssistant />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
