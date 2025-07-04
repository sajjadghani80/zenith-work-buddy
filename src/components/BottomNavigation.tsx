
import React from 'react';
import { Calendar, MessageSquare, Phone, CheckSquare, Mic, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t z-50 shadow-lg"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopColor: 'rgba(110, 110, 115, 0.2)'
      }}
    >
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                isActive ? 'scale-105' : 'hover:scale-105'
              }`}
              style={{
                color: isActive ? 'hsl(var(--app-primary))' : 'hsl(var(--app-text-secondary))',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent'
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
              {isActive && (
                <div 
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'hsl(var(--app-primary))' }}
                ></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
