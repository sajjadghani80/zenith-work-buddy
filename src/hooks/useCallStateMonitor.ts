import { useState, useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CallState {
  isOnCall: boolean;
  callStartTime: Date | null;
  lastCallEndTime: Date | null;
  isListening: boolean;
}

export const useCallStateMonitor = () => {
  const [callState, setCallState] = useState<CallState>({
    isOnCall: false,
    callStartTime: null,
    lastCallEndTime: null,
    isListening: false,
  });
  const { toast } = useToast();

  const handleCallStateChange = useCallback(async (state: 'started' | 'ended') => {
    const now = new Date();
    
    if (state === 'started') {
      setCallState(prev => ({
        ...prev,
        isOnCall: true,
        callStartTime: now,
      }));
      
      console.log('Call started at:', now);
    } else if (state === 'ended') {
      setCallState(prev => {
        const duration = prev.callStartTime 
          ? Math.floor((now.getTime() - prev.callStartTime.getTime()) / 1000)
          : 0;
        
        // Log the call end for potential AI response
        if (duration > 5) { // Only process calls longer than 5 seconds
          triggerPostCallAI(duration);
        }
        
        return {
          ...prev,
          isOnCall: false,
          callStartTime: null,
          lastCallEndTime: now,
        };
      });
      
      console.log('Call ended at:', now);
    }
  }, []);

  const triggerPostCallAI = useCallback(async (duration: number) => {
    try {
      // Generate AI response for post-call action
      const { data, error } = await supabase.functions.invoke('smart-assistant-response', {
        body: { 
          type: 'post_call',
          context: {
            duration,
            timestamp: new Date().toISOString(),
          }
        }
      });

      if (error) throw error;

      if (data?.message) {
        toast({
          title: "Call Ended",
          description: data.message,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to generate post-call AI response:', error);
    }
  }, [toast]);

  const startMonitoring = useCallback(async () => {
    try {
      const device = await Device.getInfo();
      
      if (device.platform === 'web') {
        console.log('Call monitoring not available in web browser');
        return;
      }

      // Listen for app state changes to detect calls
      App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive && !callState.isOnCall) {
          // App went to background, might be on a call
          handleCallStateChange('started');
        } else if (isActive && callState.isOnCall) {
          // App became active, call might have ended
          setTimeout(() => {
            handleCallStateChange('ended');
          }, 1000); // Small delay to ensure call actually ended
        }
      });

      setCallState(prev => ({ ...prev, isListening: true }));
      console.log('Call state monitoring started');
      
    } catch (error) {
      console.error('Failed to start call monitoring:', error);
    }
  }, [callState.isOnCall, handleCallStateChange]);

  const stopMonitoring = useCallback(async () => {
    try {
      await App.removeAllListeners();
      setCallState(prev => ({ ...prev, isListening: false }));
      console.log('Call state monitoring stopped');
    } catch (error) {
      console.error('Failed to stop call monitoring:', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  const sendAIResponse = useCallback(async (type: 'missed_call' | 'busy_response', context?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('smart-assistant-response', {
        body: { type, context }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to send AI response:', error);
      return null;
    }
  }, []);

  return {
    callState,
    startMonitoring,
    stopMonitoring,
    sendAIResponse,
  };
};