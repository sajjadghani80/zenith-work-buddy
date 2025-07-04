
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useTwilioVoice = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkConfiguration = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('twilio-voice', {
        body: { action: 'check-config' }
      });
      
      if (error) throw error;
      setIsConfigured(data?.configured || false);
    } catch (error) {
      console.error('Failed to check Twilio configuration:', error);
      setIsConfigured(false);
    }
  }, []);

  const makeCall = useCallback(async (phoneNumber: string, message: string) => {
    if (!isConfigured) {
      toast({
        title: "Twilio Not Configured",
        description: "Please configure your Twilio credentials first.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('twilio-voice/make-call', {
        body: { to: phoneNumber, message }
      });

      if (error) throw error;

      toast({
        title: "Call Initiated",
        description: `Call to ${phoneNumber} has been started.`,
      });

      return data;
    } catch (error) {
      console.error('Failed to make call:', error);
      toast({
        title: "Call Failed",
        description: "Failed to initiate the call. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, toast]);

  const getWebhookUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/functions/v1/twilio-voice/webhook`;
  }, []);

  return {
    isConfigured,
    isLoading,
    checkConfiguration,
    makeCall,
    getWebhookUrl,
  };
};
