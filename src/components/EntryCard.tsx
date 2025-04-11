
import React from 'react';
import { JournalEntry } from '@/contexts/JournalContext';
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/utils/dateUtils';
import { TagIcon, FileTextIcon, MicIcon, VideoIcon } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick }) => {
  const { title, content, date, tags, type, wallpaper = 'gradient-blue' } = entry;
  
  const renderTypeIcon = () => {
    switch (type) {
      case 'audio':
        return <MicIcon className="h-4 w-4" />;
      case 'video':
        return <VideoIcon className="h-4 w-4" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };
  
  const getBackgroundClass = () => {
    switch (wallpaper) {
      case 'gradient-purple':
        return 'bg-journal-purple/30';
      case 'gradient-pink':
        return 'bg-journal-pink/30';
      case 'gradient-peach':
        return 'bg-journal-peach/30';
      case 'gradient-gray':
        return 'bg-journal-gray/30';
      default:
        return 'bg-journal-blue/30';
    }
  };

  return (
    <div 
      className={`journal-card ${getBackgroundClass()} p-5 cursor-pointer 
        hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fade-up`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {renderTypeIcon()}
          <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
        </div>
      </div>
      
      <h3 className="font-serif font-medium text-xl mb-2 line-clamp-1">{title}</h3>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{content}</p>
      
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
            <TagIcon className="h-3 w-3 mr-1" /> {tag}
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            +{tags.length - 3}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default EntryCard;
