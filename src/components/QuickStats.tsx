
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
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      icon: Calendar,
      label: 'Meetings',
      value: todaysMeetings,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      icon: Lightbulb,
      label: 'New Ideas',
      value: 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    },
    {
      icon: Coffee,
      label: 'Coffee Breaks',
      value: 2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${stat.iconBg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
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
