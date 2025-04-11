
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SendIcon, RefreshCwIcon } from 'lucide-react';
import { useJournal } from '@/contexts/JournalContext';
import { generateJournalPrompt, getAIChatResponse, summarizeEntry } from '@/lib/aiService';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Modified interface to allow system role for sending to API
interface ChatApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIAssistant: React.FC = () => {
  const { entries } = useJournal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    // Add initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hi, I'm your journaling assistant. I can help you with writing prompts, reflect on your entries, or just chat about your day. How can I assist you today?"
        }
      ]);
      
      // Generate some suggested prompts
      generateSuggestions();
    }
  }, []);
  
  const generateSuggestions = async () => {
    try {
      // Generate suggestions based on various use cases
      const prompts = [
        "Give me a writing prompt for today",
        "What should I write about my work day?",
        "How can I reflect on my feelings?",
        "Summarize my recent journal entries"
      ];
      
      setSuggestions(prompts);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare message history for context
      const messageHistory: ChatApiMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add system message
      messageHistory.unshift({
        role: 'system',
        content: 'You are a helpful, empathetic journaling assistant. Your goal is to help the user reflect, process emotions, and grow through journaling. Keep responses concise, supportive, and thoughtful.'
      });
      
      // Add user's new message
      messageHistory.push({
        role: 'user',
        content: input
      });
      
      // Get AI response
      const response = await getAIChatResponse(messageHistory);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Sorry, I'm having trouble responding right now");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif font-medium">Journaling Assistant</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSuggestions}
          title="Refresh suggestions"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start h-auto py-3 text-left whitespace-normal"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
      
      <Card className="flex-grow overflow-hidden flex flex-col">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto pb-0 flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-secondary text-foreground mr-4'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-3 bg-secondary text-foreground mr-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about journaling..."
              disabled={isLoading}
              className="focus-ring"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
