
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, MessageCircle, Smartphone } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { format } from 'date-fns';

const RecentMessages = () => {
  const { messages, isLoading, markAsRead } = useMessages();

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'chat': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'sms': return <Smartphone className="w-4 h-4 text-purple-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-green-400 bg-green-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const recentMessages = messages.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border-gray-100">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-gray-100 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-gray-800">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          Recent Chats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentMessages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-sm transition-all duration-200 ${getPriorityColor(message.priority)} ${
              !message.is_read ? 'ring-2 ring-purple-100' : ''
            }`}
            onClick={() => !message.is_read && markAsRead.mutate(message.id)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {getMessageIcon(message.message_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold text-gray-800 ${!message.is_read ? 'text-purple-800' : ''}`}>
                    {message.sender_name}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {format(new Date(message.received_at), 'HH:mm')}
                  </span>
                </div>
                
                <p className={`text-sm leading-relaxed ${!message.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                  {message.content.length > 100 
                    ? `${message.content.substring(0, 100)}...` 
                    : message.content}
                </p>
                
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded-full border border-gray-200 capitalize font-medium">
                    {message.message_type}
                  </span>
                  {!message.is_read && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {recentMessages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium mb-2">No new chats</p>
            <p className="text-sm">Go talk to someone!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
