import React, { useState, useEffect, useRef } from 'react';
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
  VideoIcon,
  Loader2Icon,
  ImageIcon,
  StopCircleIcon
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { generateJournalPrompt } from '@/lib/aiService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MediaRecorderHelper, uploadMediaToStorage, getMediaPreview } from '@/utils/mediaUtils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JournalEditorProps {
  isNew?: boolean;
  onSave?: () => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ 
  isNew = false, 
  onSave 
}) => {
  const { currentEntry, addEntry, updateEntry, deleteEntry, wallpapers } = useJournal();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [entryType, setEntryType] = useState<'text' | 'audio' | 'video'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>("gradient-blue");
  
  const recorderRef = useRef<MediaRecorderHelper | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (currentEntry && !isNew) {
      setTitle(currentEntry.title);
      setContent(currentEntry.content);
      setTags([...currentEntry.tags]);
      setEntryType(currentEntry.type);
      setMediaUrl(currentEntry.mediaUrl || "");
      setWallpaper(currentEntry.wallpaper || "gradient-blue");
    } else {
      setTitle("");
      setContent("");
      setTags([]);
      setEntryType('text');
      setMediaUrl("");
      setWallpaper("gradient-blue");
    }
  }, [currentEntry, isNew]);
  
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

  const startRecording = async (type: 'audio' | 'video') => {
    if (!user) {
      toast.error("You must be logged in to record");
      return;
    }
    
    try {
      recorderRef.current = new MediaRecorderHelper({
        onDataAvailable: (blob) => {
          console.log("Data chunk available", blob.size);
        },
        onStart: () => {
          setIsRecording(true);
          toast.info(`${type === 'audio' ? 'Audio' : 'Video'} recording started`);
          
          if (type === 'video' && videoPreviewRef.current && recorderRef.current) {
            const stream = recorderRef.current.getStream();
            if (stream) {
              videoPreviewRef.current.srcObject = stream;
              videoPreviewRef.current.play();
            }
          }
        },
        onStop: () => {
          setIsRecording(false);
          toast.info(`${type === 'audio' ? 'Audio' : 'Video'} recording stopped`);
          
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = null;
          }
        }
      });
      
      if (type === 'audio') {
        await recorderRef.current.startAudioRecording();
        setEntryType('audio');
      } else {
        await recorderRef.current.startVideoRecording();
        setEntryType('video');
      }
    } catch (error) {
      console.error(`Failed to start ${type} recording:`, error);
      toast.error(`Could not start ${type} recording. Please check permissions.`);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;
    
    try {
      recorderRef.current.stop();
      const blob = recorderRef.current.getBlob();
      
      if (blob && user) {
        setIsLoading(true);
        toast.info("Uploading media...");
        
        const url = await uploadMediaToStorage(blob, user.id, entryType);
        setMediaUrl(url);
        
        toast.success("Media uploaded successfully");
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      toast.error("Failed to process recording");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your entry");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to save entries");
      return;
    }

    setIsLoading(true);
    
    try {
      const entryData = {
        title,
        content,
        date: new Date(),
        tags,
        type: entryType,
        mediaUrl,
        wallpaper
      };
      
      if (currentEntry && !isNew) {
        await updateEntry({
          ...currentEntry,
          ...entryData
        });
        toast.success("Journal entry updated");
      } else {
        await addEntry(entryData);
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

  const handleDelete = async () => {
    if (currentEntry && !isNew) {
      setIsLoading(true);
      try {
        await deleteEntry(currentEntry.id);
        toast.success("Journal entry deleted");
        if (onSave) onSave();
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast.error("Failed to delete journal entry");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderMediaPreview = () => {
    if (!mediaUrl || isRecording) return null;
    if (entryType === 'text') return null;
    
    return getMediaPreview(mediaUrl, entryType as 'audio' | 'video');
  };

  return (
    <div 
      className={`space-y-6 animate-fade-up p-6 rounded-lg border ${wallpaper === 'gradient-blue' ? 'bg-journal-blue/30' : 
      wallpaper === 'gradient-purple' ? 'bg-journal-purple/30' : 
      wallpaper === 'gradient-pink' ? 'bg-journal-pink/30' :
      wallpaper === 'gradient-peach' ? 'bg-journal-peach/30' : 
      'bg-journal-gray/30'}`}
    >
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
          {!isRecording ? (
            <>
              <Button
                variant="outline"
                size="icon"
                title="Record Audio"
                className="h-9 w-9"
                onClick={() => startRecording('audio')}
                disabled={isRecording || isLoading}
              >
                <MicIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                title="Record Video"
                className="h-9 w-9"
                onClick={() => startRecording('video')}
                disabled={isRecording || isLoading}
              >
                <VideoIcon className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              title="Stop Recording"
              className="animate-pulse flex items-center"
              onClick={stopRecording}
            >
              <StopCircleIcon className="h-4 w-4 mr-1" />
              Stop Recording
            </Button>
          )}
        </div>
      </div>

      {prompt && isNew && (
        <div className="bg-journal-purple/30 p-4 rounded-lg">
          <p className="text-sm font-medium">Today's prompt:</p>
          <p className="text-base italic">{prompt}</p>
        </div>
      )}

      {entryType === 'video' && videoPreviewRef.current && (
        <div className="relative rounded-lg overflow-hidden border bg-black">
          <video 
            ref={videoPreviewRef} 
            className="w-full h-64 object-cover" 
            autoPlay 
            muted 
            playsInline
          />
          {isRecording && (
            <div className="absolute top-2 right-2">
              <div className="bg-red-500 rounded-full h-3 w-3 animate-pulse"></div>
            </div>
          )}
        </div>
      )}

      {renderMediaPreview()}

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
          <Label htmlFor="wallpaper">Wallpaper</Label>
          <Select 
            value={wallpaper} 
            onValueChange={setWallpaper}
          >
            <SelectTrigger className="focus-ring">
              <SelectValue placeholder="Select a wallpaper" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Wallpapers</SelectLabel>
                <SelectItem value="gradient-blue">Blue</SelectItem>
                <SelectItem value="gradient-purple">Purple</SelectItem>
                <SelectItem value="gradient-pink">Pink</SelectItem>
                <SelectItem value="gradient-peach">Peach</SelectItem>
                <SelectItem value="gradient-gray">Gray</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <div className="grid grid-cols-5 gap-2 mt-2">
            {wallpapers.map(wp => (
              <div 
                key={wp} 
                onClick={() => setWallpaper(wp)}
                className={`h-8 rounded-md cursor-pointer transition-all duration-200 ${
                  wallpaper === wp ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                } ${
                  wp === 'gradient-blue' ? 'bg-journal-blue' : 
                  wp === 'gradient-purple' ? 'bg-journal-purple' :
                  wp === 'gradient-pink' ? 'bg-journal-pink' :
                  wp === 'gradient-peach' ? 'bg-journal-peach' :
                  'bg-journal-gray'
                }`}
              />
            ))}
          </div>
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
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2Icon className="h-4 w-4 mr-2" />
            )}
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
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <SaveIcon className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;
