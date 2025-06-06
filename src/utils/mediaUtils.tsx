
import React from 'react';

interface MediaRecorderOptions {
  onDataAvailable: (data: Blob) => void;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: Error) => void;
  timeSlice?: number; // in milliseconds
}

export class MediaRecorderHelper {
  private mediaRecorder: MediaRecorder | null = null;
  protected stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private options: MediaRecorderOptions;

  constructor(options: MediaRecorderOptions) {
    this.options = {
      timeSlice: 1000,
      ...options,
    };
  }

  async startAudioRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await this.setupRecorder();
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  async startVideoRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      await this.setupRecorder();
    } catch (error) {
      console.error('Failed to start video recording:', error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private async setupRecorder(): Promise<void> {
    if (!this.stream) return;
    
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
        this.options.onDataAvailable(e.data);
      }
    };
    
    this.mediaRecorder.onstart = () => {
      this.options.onStart?.();
    };
    
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { 
        type: this.mediaRecorder?.mimeType || 'audio/webm' 
      });
      this.options.onDataAvailable(blob);
      this.options.onStop?.();
    };
    
    this.mediaRecorder.start(this.options.timeSlice);
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  getBlob(): Blob | null {
    if (this.chunks.length === 0) return null;
    return new Blob(this.chunks, { 
      type: this.mediaRecorder?.mimeType || 'audio/webm' 
    });
  }

  // Add a method to safely get the stream
  getStream(): MediaStream | null {
    return this.stream;
  }
}

export const uploadMediaToStorage = async (
  file: Blob, 
  userId: string, 
  type: 'audio' | 'video' | 'text'
): Promise<string> => {
  try {
    // Return early for text type since there's no file to upload
    if (type === 'text') return '';
    
    // Make sure we have valid data to upload
    if (!file || file.size === 0) {
      console.error('No valid file data to upload');
      return '';
    }
    
    const { supabase } = await import('@/integrations/supabase/client');
    const fileExt = type === 'audio' ? 'webm' : 'mp4';
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    
    console.log(`Uploading ${type} file to storage:`, fileName);
    
    const { error, data } = await supabase.storage
      .from('journal-media')
      .upload(fileName, file, {
        contentType: type === 'audio' ? 'audio/webm' : 'video/mp4',
        upsert: false
      });

    if (error) {
      console.error(`Error details:`, error);
      throw error;
    }
    
    // Get public URL after successful upload
    const { data: { publicUrl } } = supabase.storage
      .from('journal-media')
      .getPublicUrl(fileName);
      
    console.log(`Upload successful. Public URL:`, publicUrl);
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
};

// Modify this function to handle all media types including 'text'
export const getMediaPreview = (mediaUrl: string, type: 'audio' | 'video' | 'text'): JSX.Element => {
  if (!mediaUrl || type === 'text') return <></>;
  
  if (type === 'audio') {
    return (
      <audio controls className="w-full mt-2">
        <source src={mediaUrl} type="audio/webm" />
        Your browser does not support the audio element.
      </audio>
    );
  } else {
    return (
      <video controls className="w-full mt-2 rounded-lg">
        <source src={mediaUrl} type="video/mp4" />
        Your browser does not support the video element.
      </video>
    );
  }
};
