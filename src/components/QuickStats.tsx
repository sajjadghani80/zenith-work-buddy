
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Calendar, MessageSquare, Phone } from 'lucide-react';
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
      label: 'Pending Tasks',
      value: pendingTasks,
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Calendar,
      label: "Today's Meetings",
      value: todaysMeetings,
      color: 'text-green-300',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: MessageSquare,
      label: 'Unread Messages',
      value: unreadMessages,
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: Phone,
      label: "Today's Calls",
      value: todaysCalls,
      color: 'text-orange-300',
      bgColor: 'bg-orange-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-300">{stat.label}</p>
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
