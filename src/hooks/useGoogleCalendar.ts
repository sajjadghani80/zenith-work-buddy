
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{ email: string }>;
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializeGoogleCalendar = useCallback(async () => {
    try {
      // Load Google APIs
      if (!window.gapi) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      await new Promise((resolve) => window.gapi.load('client:auth2', resolve));

      // Initialize the client
      await window.gapi.client.init({
        apiKey: 'YOUR_GOOGLE_API_KEY', // This will need to be configured
        clientId: 'YOUR_GOOGLE_CLIENT_ID', // This will need to be configured
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar'
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      setIsConnected(isSignedIn);

      return authInstance;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      toast({
        title: "Google Calendar Error",
        description: "Failed to initialize Google Calendar. Please check your configuration.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const connectToGoogleCalendar = useCallback(async () => {
    setIsLoading(true);
    try {
      const authInstance = await initializeGoogleCalendar();
      if (authInstance) {
        const result = await authInstance.signIn();
        if (result) {
          setIsConnected(true);
          toast({
            title: "Connected to Google Calendar",
            description: "You can now sync meetings with your Google Calendar.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializeGoogleCalendar, toast]);

  const createGoogleCalendarEvent = useCallback(async (event: GoogleCalendarEvent) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      toast({
        title: "Meeting Added to Google Calendar",
        description: "Your meeting has been successfully added to Google Calendar.",
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to add meeting to Google Calendar.",
        variant: "destructive",
      });
      return null;
    }
  }, [isConnected, toast]);

  return {
    isConnected,
    isLoading,
    connectToGoogleCalendar,
    createGoogleCalendarEvent,
    initializeGoogleCalendar
  };
};

// Extend window object for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}
