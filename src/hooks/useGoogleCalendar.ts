
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

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
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

      // TODO: Configure Google Calendar API credentials
      // For production, these should be stored as Supabase secrets and retrieved via an edge function
      // For now, you need to replace these placeholder values with your actual Google API credentials
      const googleApiKey = 'YOUR_GOOGLE_API_KEY_HERE'; // Replace with actual API key
      const googleClientId = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // Replace with actual client ID
      
      if (googleApiKey === 'YOUR_GOOGLE_API_KEY_HERE' || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        throw new Error('Google Calendar API credentials not configured. Please replace the placeholder values in useGoogleCalendar.ts with your actual Google API credentials.');
      }

      // Initialize the client
      await window.gapi.client.init({
        apiKey: googleApiKey,
        clientId: googleClientId,
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

  const getAvailableTimeSlots = useCallback(async (date: Date) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return [];
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0); // 9 AM
      
      const endOfDay = new Date(date);
      endOfDay.setHours(17, 0, 0, 0); // 5 PM

      // Get existing events for the day
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const existingEvents = response.result.items || [];
      
      // Generate all possible 30-minute slots
      const allSlots: TimeSlot[] = [];
      const current = new Date(startOfDay);
      
      while (current < endOfDay) {
        const slotEnd = new Date(current.getTime() + 30 * 60 * 1000); // 30 minutes
        
        // Check if this slot conflicts with existing events
        const isAvailable = !existingEvents.some((event: any) => {
          if (!event.start?.dateTime || !event.end?.dateTime) return false;
          
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          
          // Check for overlap
          return (current < eventEnd && slotEnd > eventStart);
        });
        
        allSlots.push({
          start: new Date(current),
          end: new Date(slotEnd),
          available: isAvailable
        });
        
        current.setTime(current.getTime() + 30 * 60 * 1000); // Move to next 30-minute slot
      }
      
      setAvailableSlots(allSlots);
      return allSlots;
      
    } catch (error) {
      console.error('Failed to get available time slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available time slots.",
        variant: "destructive",
      });
      return [];
    }
  }, [isConnected, toast]);

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
    availableSlots,
    connectToGoogleCalendar,
    createGoogleCalendarEvent,
    getAvailableTimeSlots,
    initializeGoogleCalendar
  };
};

// Extend window object for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}
