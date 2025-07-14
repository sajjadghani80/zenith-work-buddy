import { useState, useCallback } from 'react';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SMSMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  responded: boolean;
}

interface SMSState {
  messages: SMSMessage[];
  isMonitoring: boolean;
  hasPermission: boolean;
}

export const useSMSMonitor = () => {
  const [smsState, setSmsState] = useState<SMSState>({
    messages: [],
    isMonitoring: false,
    hasPermission: false,
  });
  const { toast } = useToast();

  const requestPermissions = useCallback(async () => {
    try {
      const device = await Device.getInfo();
      
      if (device.platform === 'web') {
        toast({
          title: "SMS Features Unavailable",
          description: "SMS monitoring requires a mobile device",
          variant: "destructive",
        });
        return false;
      }

      // Note: On mobile, you'll need to implement native permission handling
      // This is a placeholder for the web version
      setSmsState(prev => ({ ...prev, hasPermission: true }));
      
      toast({
        title: "SMS Permissions",
        description: "SMS monitoring will be available once installed on mobile",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to request SMS permissions:', error);
      return false;
    }
  }, [toast]);

  const generateAIResponse = useCallback(async (message: SMSMessage) => {
    try {
      const { data, error } = await supabase.functions.invoke('smart-assistant-response', {
        body: { 
          type: 'sms_response',
          context: {
            sender: message.sender,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
          }
        }
      });

      if (error) throw error;
      return data?.response || null;
    } catch (error) {
      console.error('Failed to generate SMS AI response:', error);
      return null;
    }
  }, []);

  const simulateIncomingSMS = useCallback(async (sender: string, content: string) => {
    const newMessage: SMSMessage = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date(),
      responded: false,
    };

    setSmsState(prev => ({
      ...prev,
      messages: [newMessage, ...prev.messages],
    }));

    // Generate AI response
    const aiResponse = await generateAIResponse(newMessage);
    
    if (aiResponse) {
      toast({
        title: `SMS from ${sender}`,
        description: `AI Response: ${aiResponse}`,
        duration: 5000,
      });

      // Mark as responded
      setSmsState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === newMessage.id ? { ...msg, responded: true } : msg
        ),
      }));

      // Save to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('messages').insert({
            sender_name: sender,
            content,
            message_type: 'sms',
            priority: 'medium',
            user_id: user.id,
          });

          if (error) throw error;
        }
      } catch (error) {
        console.error('Failed to save SMS to database:', error);
      }
    }
  }, [generateAIResponse, toast]);

  const startMonitoring = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setSmsState(prev => ({ ...prev, isMonitoring: true }));
  }, [requestPermissions]);

  const stopMonitoring = useCallback(() => {
    setSmsState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  return {
    smsState,
    startMonitoring,
    stopMonitoring,
    requestPermissions,
    simulateIncomingSMS,
    generateAIResponse,
  };
};