
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useMeetings } from '@/hooks/useMeetings';
import { format } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

const AvailableTimeSlots = () => {
  const { isConnected, availableSlots, getAvailableTimeSlots, createGoogleCalendarEvent } = useGoogleCalendar();
  const { createMeeting } = useMeetings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      getAvailableTimeSlots(selectedDate);
    }
  }, [isConnected, selectedDate, getAvailableTimeSlots]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setIsDialogOpen(true);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedSlot || !meetingTitle.trim()) return;

    setIsLoading(true);
    try {
      // Create meeting in local database
      await createMeeting.mutateAsync({
        title: meetingTitle,
        description: meetingDescription,
        start_time: selectedSlot.start.toISOString(),
        end_time: selectedSlot.end.toISOString(),
        status: 'scheduled' as const,
        attendees: [],
        location: ''
      });

      // Create event in Google Calendar
      if (isConnected) {
        const googleEvent = {
          summary: meetingTitle,
          description: meetingDescription,
          start: {
            dateTime: selectedSlot.start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: selectedSlot.end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        };

        await createGoogleCalendarEvent(googleEvent);
      }

      // Refresh available slots
      await getAvailableTimeSlots(selectedDate);
      
      // Reset form
      setMeetingTitle('');
      setMeetingDescription('');
      setSelectedSlot(null);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: 'hsl(var(--app-text-secondary))' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--app-text-primary))' }}>
            Connect Google Calendar
          </h3>
          <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
            Connect your Google Calendar to view available time slots and schedule meetings directly.
          </p>
        </CardContent>
      </Card>
    );
  }

  const availableSlotsList = availableSlots.filter(slot => slot.available);
  const bookedSlotsList = availableSlots.filter(slot => !slot.available);

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <Calendar className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Available Time Slots */}
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <Clock className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
            Available Time Slots - {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableSlotsList.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'hsl(var(--app-text-secondary))' }} />
              <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
                No available time slots for this date
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSlotsList.map((slot, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 hover:shadow-md transition-all duration-200"
                  style={{
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    color: 'hsl(var(--app-text-primary))'
                  }}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <div className="text-center">
                    <div className="font-semibold">
                      {format(slot.start, 'h:mm a')}
                    </div>
                    <div className="text-xs opacity-70">
                      {format(slot.end, 'h:mm a')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booked Time Slots */}
      {bookedSlotsList.length > 0 && (
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            backgroundColor: 'hsl(var(--app-surface))',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
              <Clock className="w-5 h-5 text-red-500" />
              Booked Time Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bookedSlotsList.map((slot, index) => (
                <div
                  key={index}
                  className="p-3 rounded border text-center"
                  style={{
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    color: 'hsl(var(--app-text-secondary))'
                  }}
                >
                  <div className="font-semibold">
                    {format(slot.start, 'h:mm a')}
                  </div>
                  <div className="text-xs opacity-70">
                    {format(slot.end, 'h:mm a')}
                  </div>
                  <div className="text-xs mt-1 text-red-600">
                    Booked
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Meeting Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <div className="p-3 bg-blue-50 rounded-lg border">
                <p className="font-semibold text-blue-900">
                  {format(selectedSlot.start, 'MMMM d, yyyy')}
                </p>
                <p className="text-blue-700">
                  {format(selectedSlot.start, 'h:mm a')} - {format(selectedSlot.end, 'h:mm a')}
                </p>
              </div>
            )}
            
            <Input
              placeholder="Meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              required
            />
            
            <Input
              placeholder="Description (optional)"
              value={meetingDescription}
              onChange={(e) => setMeetingDescription(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleScheduleMeeting}
                disabled={!meetingTitle.trim() || isLoading}
                className="flex-1"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableTimeSlots;
