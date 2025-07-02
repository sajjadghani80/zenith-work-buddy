
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { format, isToday, isTomorrow } from 'date-fns';

const UpcomingMeetings = () => {
  const { meetings, isLoading } = useMeetings();

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.start_time) > new Date())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading meetings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-300" />
          Upcoming Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingMeetings.map((meeting) => {
          const startDate = new Date(meeting.start_time);
          const endDate = new Date(meeting.end_time);
          
          return (
            <div key={meeting.id} className="p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{meeting.title}</h3>
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                  {getDateLabel(startDate)}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                </div>
                
                {meeting.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {meeting.location}
                  </div>
                )}
                
                {meeting.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {meeting.attendees.length} attendees
                  </div>
                )}
              </div>
              
              {meeting.description && (
                <p className="text-sm text-gray-400 mt-2">{meeting.description}</p>
              )}
            </div>
          );
        })}

        {upcomingMeetings.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No upcoming meetings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMeetings;
