
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-purple-200">Team communications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg border-white/20 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-300" />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-100 mb-4">
            You have 4 unread messages across Slack, Teams, and WhatsApp. 
            Key highlights: John needs to reschedule, Team Alpha praised your presentation, 
            and new project files are available for review.
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
              Auto-Reply All
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Generate Responses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-300" />
            Action Items from Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actionItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="flex-1">{item}</span>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Do It
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  chat.platform === 'Slack' ? 'bg-purple-500' :
                  chat.platform === 'Teams' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {chat.type === 'group' ? 
                    <Users className="w-6 h-6" /> : 
                    <MessageSquare className="w-6 h-6" />
                  }
                </div>
                {chat.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                    {chat.unread}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{chat.name}</h3>
                  <span className="text-xs text-gray-300">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-300 truncate">{chat.lastMessage}</p>
                <span className="text-xs text-purple-300">{chat.platform}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Reply Suggestions */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mt-6">
        <CardHeader>
          <CardTitle>AI Quick Replies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
              "Thanks for the update, I'll review and get back to you"
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
              "Great work! Let's schedule a follow-up meeting"
            </Button>
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
              "I'm currently in a meeting, will respond within an hour"
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesView;
