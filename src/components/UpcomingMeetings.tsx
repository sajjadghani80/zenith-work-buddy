
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

  const getDateColor = (date: Date) => {
    if (isToday(date)) return 'bg-green-100 text-green-700 border-green-200';
    if (isTomorrow(date)) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.start_time) > new Date())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border-gray-100">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading meetings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-gray-100 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-gray-800">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingMeetings.map((meeting) => {
          const startDate = new Date(meeting.start_time);
          const endDate = new Date(meeting.end_time);
          
          return (
            <div key={meeting.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDateColor(startDate)}`}>
                  {format(startDate, 'MMM dd')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </span>
                </div>
                
                {meeting.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{meeting.location}</span>
                  </div>
                )}
                
                {meeting.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{meeting.attendees.length} attendees</span>
                  </div>
                )}
              </div>
              
              {meeting.description && (
                <p className="text-sm text-gray-500 mt-3 bg-white p-3 rounded-lg">
                  {meeting.description}
                </p>
              )}
            </div>
          );
        })}

        {upcomingMeetings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No upcoming events</p>
            <p className="text-sm">Your schedule is clear!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMeetings;
