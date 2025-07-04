
import React from 'react';
import { Calendar, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

const GoogleCalendarSync = () => {
  const { isConnected, isLoading, connectToGoogleCalendar } = useGoogleCalendar();

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-300" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            )}
            <div>
              <h3 className="font-semibold">Google Calendar</h3>
              <p className="text-sm text-gray-300">
                {isConnected 
                  ? 'Connected - Meetings will sync automatically'
                  : 'Connect to sync meetings with Google Calendar'
                }
              </p>
            </div>
          </div>
          
          {!isConnected && (
            <Button
              onClick={connectToGoogleCalendar}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
              size="sm"
            >
              <Link className="w-4 h-4 mr-2" />
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="text-sm text-green-200 bg-green-500/10 p-3 rounded-lg">
            <p>✓ New meetings will automatically be added to your Google Calendar</p>
            <p>✓ Updates to meetings will sync in real-time</p>
          </div>
        )}

        {!isConnected && (
          <div className="text-sm text-yellow-200 bg-yellow-500/10 p-3 rounded-lg">
            <p>Connect your Google Calendar to:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Automatically sync scheduled meetings</li>
              <li>Receive notifications on your devices</li>
              <li>Access meetings from any Google Calendar app</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSync;
