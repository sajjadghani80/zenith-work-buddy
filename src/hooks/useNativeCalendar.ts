import { useState } from 'react';
import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    plugins: {
      calendar: {
        hasReadWritePermission: (
          successCallback: (hasPermission: boolean) => void,
          errorCallback: (error: any) => void
        ) => void;
        requestReadWritePermission: (
          successCallback: () => void,
          errorCallback: (error: any) => void
        ) => void;
        createEvent: (
          title: string,
          location: string,
          notes: string,
          startDate: Date,
          endDate: Date,
          successCallback: () => void,
          errorCallback: (error: any) => void
        ) => void;
        findEvent: (
          title: string,
          location: string,
          notes: string,
          startDate: Date,
          endDate: Date,
          successCallback: (events: any[]) => void,
          errorCallback: (error: any) => void
        ) => void;
        deleteEvent: (
          title: string,
          location: string,
          notes: string,
          startDate: Date,
          endDate: Date,
          successCallback: () => void,
          errorCallback: (error: any) => void
        ) => void;
      };
    };
  }
}

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
}

export const useNativeCalendar = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Native calendar not available on web platform');
      return false;
    }

    return new Promise((resolve) => {
      if (!window.plugins?.calendar) {
        console.log('Calendar plugin not available');
        resolve(false);
        return;
      }

      window.plugins.calendar.hasReadWritePermission(
        (hasPermission: boolean) => {
          setHasPermission(hasPermission);
          resolve(hasPermission);
        },
        (error: any) => {
          console.error('Error checking calendar permission:', error);
          setHasPermission(false);
          resolve(false);
        }
      );
    });
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    return new Promise((resolve) => {
      if (!window.plugins?.calendar) {
        resolve(false);
        return;
      }

      window.plugins.calendar.requestReadWritePermission(
        () => {
          setHasPermission(true);
          resolve(true);
        },
        (error: any) => {
          console.error('Error requesting calendar permission:', error);
          setHasPermission(false);
          resolve(false);
        }
      );
    });
  };

  const createEvent = async (event: CalendarEvent): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Creating event on web - would open default calendar app');
      return false;
    }

    setIsLoading(true);
    
    try {
      const permission = await checkPermission();
      if (!permission) {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return false;
        }
      }

      return new Promise((resolve) => {
        if (!window.plugins?.calendar) {
          resolve(false);
          return;
        }

        window.plugins.calendar.createEvent(
          event.title,
          event.location || '',
          event.description || '',
          event.startTime,
          event.endTime,
          () => {
            console.log('Calendar event created successfully');
            setIsLoading(false);
            resolve(true);
          },
          (error: any) => {
            console.error('Error creating calendar event:', error);
            setIsLoading(false);
            resolve(false);
          }
        );
      });
    } catch (error) {
      console.error('Error in createEvent:', error);
      setIsLoading(false);
      return false;
    }
  };

  const findEvents = async (event: CalendarEvent): Promise<any[]> => {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    return new Promise((resolve) => {
      if (!window.plugins?.calendar) {
        resolve([]);
        return;
      }

      window.plugins.calendar.findEvent(
        event.title,
        event.location || '',
        event.description || '',
        event.startTime,
        event.endTime,
        (events: any[]) => {
          resolve(events);
        },
        (error: any) => {
          console.error('Error finding calendar events:', error);
          resolve([]);
        }
      );
    });
  };

  const deleteEvent = async (event: CalendarEvent): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    return new Promise((resolve) => {
      if (!window.plugins?.calendar) {
        resolve(false);
        return;
      }

      window.plugins.calendar.deleteEvent(
        event.title,
        event.location || '',
        event.description || '',
        event.startTime,
        event.endTime,
        () => {
          console.log('Calendar event deleted successfully');
          resolve(true);
        },
        (error: any) => {
          console.error('Error deleting calendar event:', error);
          resolve(false);
        }
      );
    });
  };

  return {
    hasPermission,
    isLoading,
    checkPermission,
    requestPermission,
    createEvent,
    findEvents,
    deleteEvent,
    isNativeAvailable: Capacitor.isNativePlatform()
  };
};