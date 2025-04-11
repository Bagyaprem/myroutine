
import React, { createContext, useContext, useState, useEffect } from "react";
import { getSimpleDate } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  addEntry: (entry: Omit<JournalEntry, "id">) => Promise<JournalEntry>;
  updateEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntryForDate: (date: Date) => JournalEntry | undefined;
  loading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch entries from Supabase when user is authenticated
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setEntries([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data from database format to JournalEntry format
        const journalEntries: JournalEntry[] = data.map(entry => ({
          id: entry.id,
          date: new Date(entry.created_at),
          content: entry.content || "",
          title: entry.title,
          tags: entry.tags || [],
          type: 'text',
          mediaUrl: '',
          summary: ''
        }));

        setEntries(journalEntries);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        // Use toast function directly without title and description properties
        toast.error("Failed to load journal entries");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  const addEntry = async (entryData: Omit<JournalEntry, "id">) => {
    if (!user) {
      // Fix toast usage
      toast.error("You must be logged in to save entries");
      throw new Error("Not authenticated");
    }

    try {
      // Insert entry into Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: entryData.title,
          content: entryData.content,
          tags: entryData.tags
        })
        .select()
        .single();

      if (error) throw error;

      // Create new entry with database ID
      const newEntry: JournalEntry = {
        ...entryData,
        id: data.id
      };
      
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (error) {
      console.error("Error saving entry:", error);
      // Fix toast usage
      toast.error("Failed to save journal entry");
      throw error;
    }
  };

  const updateEntry = async (updatedEntry: JournalEntry) => {
    if (!user) {
      // Fix toast usage
      toast.error("You must be logged in to update entries");
      throw new Error("Not authenticated");
    }

    try {
      // Update entry in Supabase
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: updatedEntry.title,
          content: updatedEntry.content,
          tags: updatedEntry.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedEntry.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEntries(prev => 
        prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      
      if (currentEntry?.id === updatedEntry.id) {
        setCurrentEntry(updatedEntry);
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      // Fix toast usage
      toast.error("Failed to update journal entry");
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) {
      // Fix toast usage
      toast.error("You must be logged in to delete entries");
      throw new Error("Not authenticated");
    }

    try {
      // Delete entry from Supabase
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      if (currentEntry?.id === id) {
        setCurrentEntry(null);
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      // Fix toast usage
      toast.error("Failed to delete journal entry");
      throw error;
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
