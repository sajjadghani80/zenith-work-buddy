
import React from 'react';
import QuickStats from '@/components/QuickStats';
import TasksList from '@/components/TasksList';
import UpcomingMeetings from '@/components/UpcomingMeetings';
import RecentMessages from '@/components/RecentMessages';
import { useAuth } from '@/components/auth/AuthProvider';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-6 pb-24" style={{ backgroundColor: 'hsl(var(--app-background))' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--app-text-primary))' }}>
          Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'Muhammad'}! 👋
        </h1>
        <p className="text-lg" style={{ color: 'hsl(var(--app-text-secondary))' }}>
          Let's get creative today!
        </p>
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
