
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
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Voice Assistant</h1>
              <p className="text-purple-200">Speak naturally to manage your day</p>
            </div>
            <VoiceAssistant />
          </div>
        );
      case 'calls':
        return <CallsView />;
      case 'profile':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
              <p className="text-purple-200">Manage your account and preferences</p>
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
