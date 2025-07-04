
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, MessageCircle, Smartphone } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { format } from 'date-fns';

const RecentMessages = () => {
  const { messages, isLoading, markAsRead } = useMessages();

  const getMessageIcon = (type: string) => {
    const iconStyle = { color: 'hsl(var(--app-primary))' };
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" style={iconStyle} />;
      case 'chat': return <MessageCircle className="w-4 h-4" style={{ color: 'hsl(var(--app-accent))' }} />;
      case 'sms': return <Smartphone className="w-4 h-4" style={{ color: 'hsl(var(--app-secondary))' }} />;
      default: return <MessageSquare className="w-4 h-4" style={{ color: 'hsl(var(--app-text-secondary))' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return {
        border: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.05)'
      };
      case 'medium': return {
        border: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.05)'
      };
      case 'low': return {
        border: 'hsl(var(--app-accent))',
        bg: 'rgba(16, 185, 129, 0.05)'
      };
      default: return {
        border: 'hsl(var(--app-text-secondary))',
        bg: 'rgba(110, 110, 115, 0.05)'
      };
    }
  };

  const recentMessages = messages.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="shadow-sm" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardContent className="p-6">
          <div className="text-center" style={{ color: 'hsl(var(--app-text-secondary))' }}>
            Loading messages...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
          >
            <MessageSquare className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
          </div>
          Recent Chats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentMessages.map((message) => {
          const priorityColors = getPriorityColor(message.priority);
          return (
            <div
              key={message.id}
              className="p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-sm transition-all duration-200"
              style={{
                borderLeftColor: priorityColors.border,
                backgroundColor: !message.is_read 
                  ? 'rgba(79, 70, 229, 0.05)' 
                  : priorityColors.bg,
                ...((!message.is_read) && {
                  boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.1)'
                })
              }}
              onClick={() => !message.is_read && markAsRead.mutate(message.id)}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg shadow-sm"
                  style={{ backgroundColor: 'hsl(var(--app-surface))' }}
                >
                  {getMessageIcon(message.message_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 
                      className="font-semibold"
                      style={{ 
                        color: !message.is_read 
                          ? 'hsl(var(--app-primary))' 
                          : 'hsl(var(--app-text-primary))'
                      }}
                    >
                      {message.sender_name}
                    </h3>
                    <span 
                      className="text-xs font-medium"
                      style={{ color: 'hsl(var(--app-text-secondary))' }}
                    >
                      {format(new Date(message.received_at), 'HH:mm')}
                    </span>
                  </div>
                  
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ 
                      color: !message.is_read 
                        ? 'hsl(var(--app-text-primary))' 
                        : 'hsl(var(--app-text-secondary))'
                    }}
                  >
                    {message.content.length > 100 
                      ? `${message.content.substring(0, 100)}...` 
                      : message.content}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span 
                      className="text-xs px-2 py-1 rounded-full border capitalize font-medium"
                      style={{
                        backgroundColor: 'hsl(var(--app-surface))',
                        color: 'hsl(var(--app-text-secondary))',
                        borderColor: 'rgba(110, 110, 115, 0.2)'
                      }}
                    >
                      {message.message_type}
                    </span>
                    {!message.is_read && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-medium text-white"
                        style={{ backgroundColor: 'hsl(var(--app-primary))' }}
                      >
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {recentMessages.length === 0 && (
          <div className="text-center py-12">
            <div 
              className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(110, 110, 115, 0.1)' }}
            >
              <MessageSquare 
                className="w-10 h-10" 
                style={{ color: 'hsl(var(--app-text-secondary))' }}
              />
            </div>
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              No new chats
            </p>
            <p 
              className="text-sm"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Go talk to someone!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
