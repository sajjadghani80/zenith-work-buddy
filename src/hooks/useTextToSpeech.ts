
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string>('');

  const speak = async (text: string, voice: string = 'alloy') => {
    if (!text.trim()) return;

    try {
      setIsSpeaking(true);
      setError('');

      console.log('Converting text to speech:', text);

      const { data, error: functionError } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Function invocation failed');
      }

      if (!data) {
        console.error('No data received from function');
        throw new Error('No response from text-to-speech function');
      }

      if (!data.audioContent) {
        console.error('No audio content in response:', data);
        throw new Error('No audio content received');
      }

      // Convert base64 to audio blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      const audio = new Audio(audioUrl);
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          console.log('Speech playback completed');
          resolve();
        };

        audio.onerror = (error) => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          console.error('Audio playback error:', error);
          reject(new Error('Audio playback failed'));
        };

        audio.play().catch((error) => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          console.error('Audio play error:', error);
          reject(error);
        });
      });

    } catch (error) {
      console.error('Text-to-speech error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Speech generation failed';
      setError(errorMessage);
      setIsSpeaking(false);
      throw new Error(errorMessage);
    }
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
  };

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    error
  };
};
