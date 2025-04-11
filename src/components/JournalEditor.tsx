
import React, { useState, useEffect } from 'react';
import { useJournal, JournalEntry } from '@/contexts/JournalContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  SaveIcon, 
  TagIcon, 
  XIcon, 
  PlusIcon, 
  Trash2Icon,
  MicIcon,
  VideoIcon
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { generateJournalPrompt } from '@/lib/aiService';
import { toast } from 'sonner';

interface JournalEditorProps {
  isNew?: boolean;
  onSave?: () => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ 
  isNew = false, 
  onSave 
}) => {
  const { currentEntry, addEntry, updateEntry, deleteEntry } = useJournal();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with current entry data if editing
  useEffect(() => {
    if (currentEntry && !isNew) {
      setTitle(currentEntry.title);
      setContent(currentEntry.content);
      setTags([...currentEntry.tags]);
    } else {
      // Reset form if creating new entry
      setTitle("");
      setContent("");
      setTags([]);
    }
  }, [currentEntry, isNew]);
  
  // Get a writing prompt when creating a new entry
  useEffect(() => {
    const fetchPrompt = async () => {
      if (isNew && !prompt) {
        try {
          const newPrompt = await generateJournalPrompt();
          setPrompt(newPrompt);
        } catch (error) {
          console.error('Failed to fetch prompt:', error);
        }
      }
    };
    
    fetchPrompt();
  }, [isNew, prompt]);

  const handleAddTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim().toLowerCase())) return;
    setTags([...tags, tagInput.trim().toLowerCase()]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your entry");
      return;
    }

    setIsLoading(true);
    
    try {
      const entryData = {
        title,
        content,
        date: new Date(),
        tags,
        type: 'text' as const
      };
      
      if (currentEntry && !isNew) {
        updateEntry({
          ...currentEntry,
          ...entryData
        });
        toast.success("Journal entry updated");
      } else {
        addEntry(entryData);
        toast.success("New journal entry created");
      }
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save journal entry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (currentEntry && !isNew) {
      deleteEntry(currentEntry.id);
      toast.success("Journal entry deleted");
      if (onSave) onSave();
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-medium">
            {isNew ? "New Journal Entry" : "Edit Journal Entry"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(new Date())}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            title="Record Audio"
            className="h-9 w-9"
            disabled
          >
            <MicIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Record Video"
            className="h-9 w-9"
            disabled
          >
            <VideoIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {prompt && isNew && (
        <div className="bg-journal-purple/30 p-4 rounded-lg">
          <p className="text-sm font-medium">Today's prompt:</p>
          <p className="text-base italic">{prompt}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Entry title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus-ring"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Journal Entry</Label>
          <Textarea
            id="content"
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] focus-ring"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="focus-ring"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="flex items-center"
              size="icon"
              variant="secondary"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="px-2 py-1">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        {!isNew && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
        
        <div className="ml-auto flex space-x-2">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading}
            className="px-6"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;
