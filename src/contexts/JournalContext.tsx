
import React, { createContext, useContext, useState, useEffect } from "react";
import { getSimpleDate } from "@/utils/dateUtils";

export interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  title: string;
  tags: string[];
  type: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  summary?: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  setCurrentEntry: (entry: JournalEntry | null) => void;
  addEntry: (entry: Omit<JournalEntry, "id">) => void;
  updateEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  getEntryForDate: (date: Date) => JournalEntry | undefined;
  loading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Sample entries for demo purposes
const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    date: new Date(2025, 3, 10), // April 10, 2025
    title: "Finding Balance",
    content: "Today I tried to balance work and personal time better. I took short breaks every hour and went for a walk during lunch. I felt more productive and less stressed as a result.",
    tags: ["work", "self-care", "balance"],
    type: "text"
  },
  {
    id: "2",
    date: new Date(2025, 3, 9), // April 9, 2025
    title: "Morning Reflections",
    content: "Woke up early today and spent some time meditating. It's amazing how just 10 minutes of quiet reflection can set a positive tone for the entire day.",
    tags: ["meditation", "morning", "habits"],
    type: "text"
  },
  {
    id: "3",
    date: new Date(2025, 3, 8), // April 8, 2025
    title: "Creative Block",
    content: "Struggled with creativity today. Started several projects but couldn't seem to focus or find inspiration. Need to remember that these phases are normal and temporary.",
    tags: ["creativity", "challenges"],
    type: "text"
  }
];

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // In a real app, this would fetch entries from API/LocalStorage
  useEffect(() => {
    // Simulate loading entries from storage
    setLoading(true);
    setTimeout(() => {
      // In production, replace with actual data loading
      setLoading(false);
    }, 500);
  }, []);

  const addEntry = (entryData: Omit<JournalEntry, "id">) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: Date.now().toString()
    };
    
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = (updatedEntry: JournalEntry) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    
    if (currentEntry?.id === updatedEntry.id) {
      setCurrentEntry(updatedEntry);
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    
    if (currentEntry?.id === id) {
      setCurrentEntry(null);
    }
  };

  const getEntryForDate = (date: Date) => {
    return entries.find(entry => 
      getSimpleDate(entry.date) === getSimpleDate(date)
    );
  };

  return (
    <JournalContext.Provider
      value={{
        entries,
        currentEntry,
        setCurrentEntry,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntryForDate,
        loading
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
};
