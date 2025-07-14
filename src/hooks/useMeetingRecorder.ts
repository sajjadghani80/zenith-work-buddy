import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessedMeeting {
  summary: string;
  actionItems: Array<{
    task: string;
    assignee?: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  participants: string[];
}

export const useMeetingRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processedMeeting, setProcessedMeeting] = useState<ProcessedMeeting | null>(null);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      setError('');
      setTranscript('');
      setProcessedMeeting(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Meeting recording is now active. Speak clearly for best results.",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      toast({
        title: "Processing Recording",
        description: "Converting speech to text and generating summary...",
      });
    }
  }, [isRecording, toast]);

  const processRecording = async (audioBlob: Blob) => {
    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Convert speech to text
      console.log('Calling speech-to-text function with audio length:', audioBase64.length);
      const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: audioBase64 }
      });

      console.log('Speech-to-text response:', { data: transcriptData, error: transcriptError });

      if (transcriptError) {
        console.error('Speech-to-text error details:', transcriptError);
        throw new Error(transcriptError.message || 'Failed to convert speech to text');
      }

      if (!transcriptData?.text) {
        throw new Error('No transcript generated from audio');
      }

      setTranscript(transcriptData.text);

      // Process transcript for summary and action items
      const { data: processedData, error: processError } = await supabase.functions.invoke('process-meeting', {
        body: { transcript: transcriptData.text }
      });

      if (processError) {
        throw new Error(processError.message || 'Failed to process meeting transcript');
      }

      setProcessedMeeting(processedData);
      
      toast({
        title: "Meeting Processed",
        description: "Summary and action items have been generated successfully!",
      });

    } catch (error) {
      console.error('Error processing recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process recording';
      setError(errorMessage);
      
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveMeetingData = async (meetingId?: string) => {
    if (!processedMeeting || !transcript) {
      toast({
        title: "No Data to Save",
        description: "Please record and process a meeting first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-meeting', {
        body: { 
          transcript, 
          meetingId 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Meeting Saved",
        description: "Meeting transcript and summary have been saved successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error saving meeting data:', error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : 'Failed to save meeting data',
        variant: "destructive",
      });
    }
  };

  const clearRecording = () => {
    setTranscript('');
    setProcessedMeeting(null);
    setError('');
    audioChunksRef.current = [];
  };

  return {
    isRecording,
    isProcessing,
    transcript,
    processedMeeting,
    error,
    startRecording,
    stopRecording,
    saveMeetingData,
    clearRecording
  };
};