
import React from 'react';
import QuickStats from '@/components/QuickStats';
import TasksList from '@/components/TasksList';
import UpcomingMeetings from '@/components/UpcomingMeetings';
import RecentMessages from '@/components/RecentMessages';
import { useAuth } from '@/components/auth/AuthProvider';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'Muhammad'}! 👋
        </h1>
        <p className="text-gray-600 text-lg">Let's get creative today!</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TasksList />
        <UpcomingMeetings />
      </div>

      {/* Recent Messages */}
      <RecentMessages />
    </div>
  );
};

export default Dashboard;
