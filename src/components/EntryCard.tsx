
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from '@/utils/dateUtils';
import { JournalEntry } from '@/contexts/JournalContext';
import { ChevronRightIcon } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick }) => {
  const previewContent = entry.content.length > 120
    ? entry.content.slice(0, 120) + '...'
    : entry.content;
    
  // Choose a background color based on the entry type or other factors
  const getCardStyle = () => {
    if (entry.type === 'audio') return 'bg-journal-peach'; 
    if (entry.type === 'video') return 'bg-journal-purple';
    
    // For text entries, we can use different colors based on tags
    if (entry.tags.includes('important')) return 'bg-journal-pink';
    if (entry.tags.includes('work')) return 'bg-journal-blue';
    if (entry.tags.includes('self-care') || entry.tags.includes('meditation')) return 'bg-journal-gray';
    
    return 'bg-white';
  };

  return (
    <Card 
      className={`${getCardStyle()} hover:shadow-md transition-all cursor-pointer animate-fade-in`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{entry.title}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {formatTime(entry.date)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0">
          {formatDate(entry.date)}
        </p>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-foreground/90 whitespace-pre-line">
          {previewContent}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {entry.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{entry.tags.length - 3}
            </Badge>
          )}
        </div>
        <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
      </CardFooter>
    </Card>
  );
};

export default EntryCard;
