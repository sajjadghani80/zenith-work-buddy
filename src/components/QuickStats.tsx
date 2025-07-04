
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Calendar, Lightbulb, Coffee } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useMeetings } from '@/hooks/useMeetings';
import { useMessages } from '@/hooks/useMessages';
import { useCalls } from '@/hooks/useCalls';

const QuickStats = () => {
  const { tasks } = useTasks();
  const { meetings } = useMeetings();
  const { messages } = useMessages();
  const { calls } = useCalls();

  const pendingTasks = tasks.filter(task => !task.completed).length;
  const todaysMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.start_time);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  }).length;
  const unreadMessages = messages.filter(message => !message.is_read).length;
  const todaysCalls = calls.filter(call => {
    const callDate = new Date(call.call_time);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      icon: CheckSquare,
      label: 'Task Left',
      value: pendingTasks,
      iconColor: 'hsl(var(--app-primary))',
      bgColor: 'rgba(79, 70, 229, 0.1)'
    },
    {
      icon: Calendar,
      label: 'Meetings',
      value: todaysMeetings,
      iconColor: 'hsl(var(--app-accent))',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: Lightbulb,
      label: 'New Ideas',
      value: 0,
      iconColor: 'hsl(var(--app-secondary))',
      bgColor: 'rgba(167, 139, 250, 0.1)'
    },
    {
      icon: Coffee,
      label: 'Coffee Breaks',
      value: 2,
      iconColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{ backgroundColor: 'hsl(var(--app-surface))' }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <p 
                    className="text-3xl font-bold mb-1"
                    style={{ color: 'hsl(var(--app-text-primary))' }}
                  >
                    {stat.value}
                  </p>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'hsl(var(--app-text-secondary))' }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickStats;
