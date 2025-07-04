
import React from 'react';
import { Calendar, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

const GoogleCalendarSync = () => {
  const { isConnected, isLoading, connectToGoogleCalendar } = useGoogleCalendar();

  return (
    <Card 
      className="shadow-lg border-0" 
      style={{ 
        backgroundColor: 'hsl(var(--app-surface))',
        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle 
          className="flex items-center gap-3 text-lg font-semibold"
          style={{ color: 'hsl(var(--app-text-primary))' }}
        >
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}
          >
            <Calendar className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
          </div>
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="flex items-center justify-between p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
          style={{ 
            backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
            borderColor: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ 
                backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'
              }}
            >
              {isConnected ? (
                <CheckCircle className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
              ) : (
                <AlertCircle className="w-5 h-5" style={{ color: '#F59E0B' }} />
              )}
            </div>
            <div>
              <h3 
                className="font-semibold text-base"
                style={{ color: 'hsl(var(--app-text-primary))' }}
              >
                Google Calendar
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              >
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
              className="shadow-sm hover:shadow-md transition-all duration-200"
              style={{
                backgroundColor: 'hsl(var(--app-primary))',
                borderColor: 'hsl(var(--app-primary))',
                color: 'white'
              }}
              size="sm"
            >
              <Link className="w-4 h-4 mr-2" />
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>

        {isConnected && (
          <div 
            className="rounded-xl p-4 border shadow-sm"
            style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderColor: 'rgba(16, 185, 129, 0.2)',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: 'hsl(var(--app-accent))' }} />
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  New meetings will automatically be added to your Google Calendar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: 'hsl(var(--app-accent))' }} />
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  Updates to meetings will sync in real-time
                </p>
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div 
            className="rounded-xl p-4 border shadow-sm"
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.2)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
            }}
          >
            <p 
              className="text-sm font-semibold mb-2"
              style={{ color: 'hsl(var(--app-text-primary))' }}
            >
              Connect your Google Calendar to:
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--app-primary))' }}
                />
                <span 
                  className="text-sm"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  Automatically sync scheduled meetings
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--app-primary))' }}
                />
                <span 
                  className="text-sm"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  Receive notifications on your devices
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--app-primary))' }}
                />
                <span 
                  className="text-sm"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  Access meetings from any Google Calendar app
                </span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSync;
