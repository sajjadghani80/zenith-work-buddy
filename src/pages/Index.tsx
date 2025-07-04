
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import VoiceAssistant from '@/components/VoiceAssistant';
import CalendarView from '@/components/CalendarView';
import MessagesView from '@/components/MessagesView';
import CallsView from '@/components/CallsView';
import ProfileSettings from '@/components/ProfileSettings';
import BottomNavigation from '@/components/BottomNavigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'messages':
        return <MessagesView />;
      case 'voice':
        return (
          <div 
            className="min-h-screen p-6 pb-24"
            style={{ backgroundColor: 'hsl(var(--app-background))' }}
          >
            <div className="mb-8">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: 'hsl(var(--app-text-primary))' }}
              >
                Voice Assistant
              </h1>
              <p 
                className="text-lg"
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              >
                Speak naturally to manage your day
              </p>
            </div>
            <VoiceAssistant />
          </div>
        );
      case 'calls':
        return <CallsView />;
      case 'profile':
        return (
          <div 
            className="min-h-screen p-6 pb-24"
            style={{ backgroundColor: 'hsl(var(--app-background))' }}
          >
            <div className="mb-8">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: 'hsl(var(--app-text-primary))' }}
              >
                Profile & Settings
              </h1>
              <p 
                className="text-lg"
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              >
                Manage your account and preferences
              </p>
            </div>
            <ProfileSettings />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="relative">
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
