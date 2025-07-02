
import React from 'react';
import QuickStats from '@/components/QuickStats';
import TasksList from '@/components/TasksList';
import UpcomingMeetings from '@/components/UpcomingMeetings';
import RecentMessages from '@/components/RecentMessages';
import { useAuth } from '@/components/auth/AuthProvider';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Good day, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-purple-200">Here's your productivity overview</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6">
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TasksList />
        <UpcomingMeetings />
      </div>

      {/* Recent Messages */}
      <RecentMessages />
    </div>
  );
};

export default Dashboard;
