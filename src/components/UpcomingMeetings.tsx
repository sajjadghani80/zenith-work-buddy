
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
    if (isToday(date)) return {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: 'hsl(var(--app-accent))',
      border: 'rgba(16, 185, 129, 0.2)'
    };
    if (isTomorrow(date)) return {
      bg: 'rgba(79, 70, 229, 0.1)',
      text: 'hsl(var(--app-primary))',
      border: 'rgba(79, 70, 229, 0.2)'
    };
    return {
      bg: 'rgba(110, 110, 115, 0.1)',
      text: 'hsl(var(--app-text-secondary))',
      border: 'rgba(110, 110, 115, 0.2)'
    };
  };

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.start_time) > new Date())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="shadow-sm" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardContent className="p-6">
          <div className="text-center" style={{ color: 'hsl(var(--app-text-secondary))' }}>
            Loading meetings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
          >
            <Calendar className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
          </div>
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingMeetings.map((meeting) => {
          const startDate = new Date(meeting.start_time);
          const endDate = new Date(meeting.end_time);
          const dateColors = getDateColor(startDate);
          
          return (
            <div 
              key={meeting.id} 
              className="p-4 rounded-xl border hover:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: 'rgba(110, 110, 115, 0.05)',
                borderColor: 'rgba(110, 110, 115, 0.1)'
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold" style={{ color: 'hsl(var(--app-text-primary))' }}>
                  {meeting.title}
                </h3>
                <span 
                  className="px-3 py-1 text-xs font-medium rounded-full border"
                  style={{ 
                    backgroundColor: dateColors.bg,
                    color: dateColors.text,
                    borderColor: dateColors.border
                  }}
                >
                  {format(startDate, 'MMM dd')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: 'hsl(var(--app-text-secondary))' }} />
                  <span 
                    className="font-medium"
                    style={{ color: 'hsl(var(--app-text-secondary))' }}
                  >
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </span>
                </div>
                
                {meeting.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: 'hsl(var(--app-text-secondary))' }} />
                    <span style={{ color: 'hsl(var(--app-text-secondary))' }}>
                      {meeting.location}
                    </span>
                  </div>
                )}
                
                {meeting.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: 'hsl(var(--app-text-secondary))' }} />
                    <span style={{ color: 'hsl(var(--app-text-secondary))' }}>
                      {meeting.attendees.length} attendees
                    </span>
                  </div>
                )}
              </div>
              
              {meeting.description && (
                <p 
                  className="text-sm mt-3 p-3 rounded-lg"
                  style={{ 
                    color: 'hsl(var(--app-text-secondary))',
                    backgroundColor: 'hsl(var(--app-surface))'
                  }}
                >
                  {meeting.description}
                </p>
              )}
            </div>
          );
        })}

        {upcomingMeetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar 
              className="w-16 h-16 mx-auto mb-4 opacity-30" 
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            />
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              No upcoming events
            </p>
            <p 
              className="text-sm"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Your schedule is clear!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMeetings;
