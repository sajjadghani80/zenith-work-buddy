
import React, { useState } from 'react';
import { MessageSquare, Send, Search, Bell, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MessagesView = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = [
    {
      id: 1,
      name: 'Team Alpha',
      lastMessage: 'Great work on the presentation!',
      time: '2 min ago',
      unread: 3,
      type: 'group',
      platform: 'Slack'
    },
    {
      id: 2,
      name: 'John Smith',
      lastMessage: 'Can we reschedule the meeting?',
      time: '15 min ago',
      unread: 1,
      type: 'direct',
      platform: 'Teams'
    },
    {
      id: 3,
      name: 'Project Beta',
      lastMessage: 'Files uploaded to shared drive',
      time: '1 hour ago',
      unread: 0,
      type: 'group',
      platform: 'Slack'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      lastMessage: 'Thanks for the quick response!',
      time: '2 hours ago',
      unread: 0,
      type: 'direct',
      platform: 'WhatsApp'
    }
  ];

  const actionItems = [
    'Schedule follow-up meeting with John',
    'Review project files in shared drive',
    'Respond to client inquiry about timeline',
    'Share presentation with stakeholders'
  ];

  return (
    <div 
      className="min-h-screen p-4 pb-20"
      style={{ backgroundColor: 'hsl(var(--app-background))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 
            className="text-2xl font-bold mb-1"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            Messages
          </h1>
          <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
            Team communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-200 shadow-sm"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-200 shadow-sm"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      <Card 
        className="mb-6 border-0 shadow-sm"
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(167, 139, 250, 0.05))'
        }}
      >
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <MessageSquare 
              className="w-5 h-5" 
              style={{ color: 'hsl(var(--app-primary))' }}
            />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p 
            className="mb-4"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            You have 4 unread messages across Slack, Teams, and WhatsApp. 
            Key highlights: John needs to reschedule, Team Alpha praised your presentation, 
            and new project files are available for review.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="shadow-sm"
              style={{ 
                backgroundColor: 'hsl(var(--app-primary))',
                color: 'white'
              }}
            >
              Auto-Reply All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-gray-200 shadow-sm"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Generate Responses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card 
        className="mb-6 border-0 shadow-sm"
        style={{ backgroundColor: 'hsl(var(--app-surface))' }}
      >
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <Users 
              className="w-5 h-5" 
              style={{ color: 'hsl(var(--app-secondary))' }}
            />
            Action Items from Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actionItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-lg hover:shadow-sm transition-all"
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.03)' }}
            >
              <input type="checkbox" className="w-4 h-4 rounded accent-indigo-500" />
              <span 
                className="flex-1"
                style={{ color: 'hsl(var(--app-text-primary))' }}
              >
                {item}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-gray-200 shadow-sm"
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              >
                Do It
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card 
        className="mb-6 border-0 shadow-sm"
        style={{ backgroundColor: 'hsl(var(--app-surface))' }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'hsl(var(--app-text-primary))' }}>
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              className="flex items-center gap-4 p-4 rounded-lg hover:shadow-sm transition-all cursor-pointer"
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.03)' }}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="relative">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    chat.platform === 'Slack' ? 'bg-purple-100' :
                    chat.platform === 'Teams' ? 'bg-blue-100' : 'bg-green-100'
                  }`}
                  style={{
                    backgroundColor: chat.platform === 'Slack' ? 'rgba(167, 139, 250, 0.2)' :
                      chat.platform === 'Teams' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {chat.type === 'group' ? 
                    <Users 
                      className="w-6 h-6" 
                      style={{ 
                        color: chat.platform === 'Slack' ? 'hsl(var(--app-secondary))' :
                          chat.platform === 'Teams' ? 'hsl(var(--app-primary))' : 'hsl(var(--app-accent))'
                      }}
                    /> : 
                    <MessageSquare 
                      className="w-6 h-6" 
                      style={{ 
                        color: chat.platform === 'Slack' ? 'hsl(var(--app-secondary))' :
                          chat.platform === 'Teams' ? 'hsl(var(--app-primary))' : 'hsl(var(--app-accent))'
                      }}
                    />
                  }
                </div>
                {chat.unread > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    {chat.unread}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 
                    className="font-semibold"
                    style={{ color: 'hsl(var(--app-text-primary))' }}
                  >
                    {chat.name}
                  </h3>
                  <span 
                    className="text-xs"
                    style={{ color: 'hsl(var(--app-text-secondary))' }}
                  >
                    {chat.time}
                  </span>
                </div>
                <p 
                  className="text-sm truncate"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  {chat.lastMessage}
                </p>
                <span 
                  className="text-xs"
                  style={{ color: 'hsl(var(--app-primary))' }}
                >
                  {chat.platform}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Reply Suggestions */}
      <Card 
        className="border-0 shadow-sm"
        style={{ backgroundColor: 'hsl(var(--app-surface))' }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'hsl(var(--app-text-primary))' }}>
            AI Quick Replies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full border-gray-200 shadow-sm justify-start hover:shadow-md transition-all"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              "Thanks for the update, I'll review and get back to you"
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-gray-200 shadow-sm justify-start hover:shadow-md transition-all"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              "Great work! Let's schedule a follow-up meeting"
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-gray-200 shadow-sm justify-start hover:shadow-md transition-all"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              "I'm currently in a meeting, will respond within an hour"
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesView;
