
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMeetings } from '@/hooks/useMeetings';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { format, isToday, isTomorrow } from 'date-fns';
import GoogleCalendarSync from './GoogleCalendarSync';

const CalendarView = () => {
  const { meetings, isLoading, createMeeting } = useMeetings();
  const { isConnected, createGoogleCalendarEvent } = useGoogleCalendar();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: [] as string[],
  });
  const [attendeesInput, setAttendeesInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create meeting in local database
      const meetingData = {
        ...newMeeting,
        attendees: attendeesInput ? attendeesInput.split(',').map(email => email.trim()) : [],
        status: 'scheduled' as const,
      };
      
      await createMeeting.mutateAsync(meetingData);

      // If Google Calendar is connected, sync the meeting
      if (isConnected && createGoogleCalendarEvent) {
        const googleEvent = {
          summary: newMeeting.title,
          description: newMeeting.description,
          start: {
            dateTime: new Date(newMeeting.start_time).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: new Date(newMeeting.end_time).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: newMeeting.location,
          attendees: meetingData.attendees.map(email => ({ email })),
        };

        await createGoogleCalendarEvent(googleEvent);
      }

      // Reset form
      setNewMeeting({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        attendees: [],
      });
      setAttendeesInput('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (isLoading) {
    return (
      <div 
        className="min-h-screen p-4 pb-20 flex items-center justify-center"
        style={{ backgroundColor: 'hsl(var(--app-background))' }}
      >
        <div 
          className="text-xl"
          style={{ color: 'hsl(var(--app-text-primary))' }}
        >
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 pb-20"
      style={{ backgroundColor: 'hsl(var(--app-background))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 
            className="text-2xl font-bold mb-1"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            Calendar
          </h1>
          <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
            Manage your schedule
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="shadow-sm"
          style={{ 
            backgroundColor: 'hsl(var(--app-primary))',
            color: 'white'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Meeting
        </Button>
      </div>

      {/* Google Calendar Integration */}
      <div className="mb-6">
        <GoogleCalendarSync />
      </div>

      {/* Add Meeting Form */}
      {showAddForm && (
        <Card 
          className="mb-6 border-0 shadow-sm"
          style={{ backgroundColor: 'hsl(var(--app-surface))' }}
        >
          <CardHeader>
            <CardTitle style={{ color: 'hsl(var(--app-text-primary))' }}>
              Schedule New Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Meeting title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                className="border-gray-200"
                required
              />
              
              <Textarea
                placeholder="Description (optional)"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                className="border-gray-200"
                rows={3}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'hsl(var(--app-text-primary))' }}
                  >
                    Start Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.start_time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })}
                    className="border-gray-200"
                    required
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'hsl(var(--app-text-primary))' }}
                  >
                    End Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.end_time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })}
                    className="border-gray-200"
                    required
                  />
                </div>
              </div>
              
              <Input
                placeholder="Location (optional)"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                className="border-gray-200"
              />

              <Input
                placeholder="Attendees (comma-separated emails)"
                value={attendeesInput}
                onChange={(e) => setAttendeesInput(e.target.value)}
                className="border-gray-200"
              />
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="shadow-sm"
                  style={{ 
                    backgroundColor: 'hsl(var(--app-accent))',
                    color: 'white'
                  }}
                >
                  Schedule Meeting
                  {isConnected && <span className="text-xs ml-1">(+ Google Cal)</span>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-200"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Meetings */}
      <Card 
        className="mb-6 border-0 shadow-sm"
        style={{ backgroundColor: 'hsl(var(--app-surface))' }}
      >
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <Calendar className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar 
                className="w-12 h-12 mx-auto mb-3 opacity-30" 
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              />
              <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
                No upcoming meetings scheduled
              </p>
              <p 
                className="text-sm mt-1"
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              >
                Click "Add Meeting" to schedule one
              </p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => {
              const startDate = new Date(meeting.start_time);
              const endDate = new Date(meeting.end_time);
              
              return (
                <div 
                  key={meeting.id} 
                  className="flex items-start gap-4 p-4 rounded-lg hover:shadow-sm transition-all cursor-pointer"
                  style={{ backgroundColor: 'rgba(79, 70, 229, 0.03)' }}
                >
                  <div 
                    className="w-4 h-4 rounded-full mt-1"
                    style={{ backgroundColor: 'hsl(var(--app-primary))' }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 
                        className="font-semibold text-lg"
                        style={{ color: 'hsl(var(--app-text-primary))' }}
                      >
                        {meeting.title}
                      </h3>
                      <span 
                        className="text-sm px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          color: 'hsl(var(--app-primary))'
                        }}
                      >
                        {getDateLabel(startDate)}
                      </span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-4 mb-2 text-sm"
                      style={{ color: 'hsl(var(--app-text-secondary))' }}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                      </div>
                      
                      {meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.attendees.length} attendees
                        </div>
                      )}
                      
                      {meeting.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </div>
                      )}
                    </div>
                    
                    {meeting.description && (
                      <p 
                        className="text-sm mb-2"
                        style={{ color: 'hsl(var(--app-text-secondary))' }}
                      >
                        {meeting.description}
                      </p>
                    )}
                    
                    {meeting.attendees.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {meeting.attendees.map((attendee, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 rounded-full text-xs"
                            style={{ 
                              backgroundColor: 'rgba(167, 139, 250, 0.1)',
                              color: 'hsl(var(--app-secondary))'
                            }}
                          >
                            {attendee}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-200 shadow-sm"
                    style={{ color: 'hsl(var(--app-text-secondary))' }}
                  >
                    Join
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card 
          className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
          style={{ backgroundColor: 'hsl(var(--app-surface))' }}
        >
          <CardContent className="p-4 text-center">
            <Calendar 
              className="w-8 h-8 mx-auto mb-2" 
              style={{ color: 'hsl(var(--app-primary))' }}
            />
            <h3 
              className="font-semibold mb-1"
              style={{ color: 'hsl(var(--app-text-primary))' }}
            >
              Schedule Meeting
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Find available time slots
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
          style={{ backgroundColor: 'hsl(var(--app-surface))' }}
        >
          <CardContent className="p-4 text-center">
            <Users 
              className="w-8 h-8 mx-auto mb-2" 
              style={{ color: 'hsl(var(--app-accent))' }}
            />
            <h3 
              className="font-semibold mb-1"
              style={{ color: 'hsl(var(--app-text-primary))' }}
            >
              Team Availability
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Check team schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Integration Status */}
      <Card 
        className="border-0 shadow-sm"
        style={{ backgroundColor: 'hsl(var(--app-surface))' }}
      >
        <CardHeader>
          <CardTitle 
            className="text-lg"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            Calendar Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-accent))' }}
              ></div>
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>
                Google Calendar
              </span>
            </div>
            <span 
              className="text-sm"
              style={{ color: 'hsl(var(--app-accent))' }}
            >
              Connected
            </span>
          </div>
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>
                Outlook Calendar
              </span>
            </div>
            <span className="text-sm text-yellow-600">Syncing...</span>
          </div>
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>
                iCloud Calendar
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-gray-200 shadow-sm"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
