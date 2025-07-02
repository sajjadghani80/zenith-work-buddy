
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, MessageCircle, Smartphone } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { format } from 'date-fns';

const RecentMessages = () => {
  const { messages, isLoading, markAsRead } = useMessages();

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'chat': return <MessageCircle className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const recentMessages = messages.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-300" />
          Recent Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentMessages.map((message) => (
          <div
            key={message.id}
            className={`p-3 bg-white/5 rounded-lg border-l-4 cursor-pointer hover:bg-white/10 transition-colors ${getPriorityColor(message.priority)} ${
              !message.is_read ? 'bg-white/10' : ''
            }`}
            onClick={() => !message.is_read && markAsRead.mutate(message.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-gray-300 mt-1">
                {getMessageIcon(message.message_type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-medium ${!message.is_read ? 'text-white' : 'text-gray-300'}`}>
                    {message.sender_name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {format(new Date(message.received_at), 'HH:mm')}
                  </span>
                </div>
                
                <p className={`text-sm ${!message.is_read ? 'text-gray-200' : 'text-gray-400'}`}>
                  {message.content.length > 100 
                    ? `${message.content.substring(0, 100)}...` 
                    : message.content}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded capitalize">
                    {message.message_type}
                  </span>
                  {!message.is_read && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      Unread
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {recentMessages.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
