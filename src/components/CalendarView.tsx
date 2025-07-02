
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const meetings = [
    {
      id: 1,
      title: 'Team Standup',
      time: '9:00 AM - 9:30 AM',
      attendees: ['John', 'Sarah', 'Mike'],
      location: 'Conference Room A',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Client Presentation',
      time: '2:00 PM - 3:00 PM',
      attendees: ['Client Team', 'Product Manager'],
      location: 'Virtual Meeting',
      color: 'bg-purple-500'
    },
    {
      id: 3,
      title: 'Project Review',
      time: '4:30 PM - 5:30 PM',
      attendees: ['Development Team'],
      location: 'Conference Room B',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-purple-200">Manage your schedule</p>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Meeting
        </Button>
      </div>

      {/* Today's Schedule */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-300" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className={`w-4 h-4 rounded-full ${meeting.color} mt-1`}></div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{meeting.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {meeting.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {meeting.attendees.length} attendees
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {meeting.location}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {meeting.attendees.map((attendee, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-500/20 rounded-full text-xs">
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Join
              </Button>
            </div>
          ))}
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
