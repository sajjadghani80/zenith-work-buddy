
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMeetings } from '@/hooks/useMeetings';
import { format, isToday, isTomorrow } from 'date-fns';

const CalendarView = () => {
  const { meetings, isLoading, createMeeting } = useMeetings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeeting.mutateAsync({
      ...newMeeting,
      status: 'scheduled' as const,
    });
    setNewMeeting({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      attendees: [],
    });
    setShowAddForm(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-purple-200">Manage your schedule</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Meeting
        </Button>
      </div>

      {/* Add Meeting Form */}
      {showAddForm && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
          <CardHeader>
            <CardTitle>Schedule New Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Meeting title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                required
              />
              
              <Textarea
                placeholder="Description (optional)"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                rows={3}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.start_time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.end_time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              
              <Input
                placeholder="Location (optional)"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  Schedule Meeting
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-300" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming meetings scheduled</p>
              <p className="text-sm">Click "Add Meeting" to schedule one</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => {
              const startDate = new Date(meeting.start_time);
              const endDate = new Date(meeting.end_time);
              
              return (
                <div key={meeting.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mt-1"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {getDateLabel(startDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2 text-sm text-gray-300">
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
                      <p className="text-gray-400 text-sm mb-2">{meeting.description}</p>
                    )}
                    
                    {meeting.attendees.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {meeting.attendees.map((attendee, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-200">
                            {attendee}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white/20 text-white hover:bg-white/10"
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
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-300 mx-auto mb-2" />
            <h3 className="font-semibold">Schedule Meeting</h3>
            <p className="text-sm text-blue-200">Find available time slots</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <h3 className="font-semibold">Team Availability</h3>
            <p className="text-sm text-green-200">Check team schedules</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Integration Status */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Calendar Sync Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Google Calendar</span>
            </div>
            <span className="text-sm text-green-200">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Outlook Calendar</span>
            </div>
            <span className="text-sm text-yellow-200">Syncing...</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>iCloud Calendar</span>
            </div>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
