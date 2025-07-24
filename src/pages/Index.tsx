
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import VoiceAssistant from '@/components/VoiceAssistant';
import CalendarView from '@/components/CalendarView';
import MessagesView from '@/components/MessagesView';
import CallsView from '@/components/CallsView';
import SmartCommunicationAssistant from '@/components/SmartCommunicationAssistant';
import ProfileSettings from '@/components/ProfileSettings';
import BottomNavigation from '@/components/BottomNavigation';
import AppLayout from '@/components/AppLayout';

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
      case 'meeting-assist':
        return (
          <AppLayout 
            title="Meeting Assist" 
            subtitle="Record and summarize meetings in English & Urdu"
          >
            <VoiceAssistant />
          </AppLayout>
        );
      case 'smart-comm':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Smart Communication</h1>
            <SmartCommunicationAssistant />
          </div>
        );
      case 'calls':
        return <CallsView />;
      case 'profile':
        return (
          <AppLayout 
            title="Profile & Settings" 
            subtitle="Manage your account and preferences"
            showSubscription={true}
          >
            <ProfileSettings />
          </AppLayout>
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
