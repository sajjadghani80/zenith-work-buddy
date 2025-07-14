import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Smartphone, Bell, Settings, Play, Pause, PhoneCall } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCallStateMonitor } from '@/hooks/useCallStateMonitor';
import { useSMSMonitor } from '@/hooks/useSMSMonitor';

const SmartCommunicationAssistant = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [testSender, setTestSender] = useState('');
  const [testMessage, setTestMessage] = useState('');
  
  const { callState, startMonitoring: startCallMonitoring, stopMonitoring: stopCallMonitoring, sendAIResponse } = useCallStateMonitor();
  const { smsState, startMonitoring: startSMSMonitoring, stopMonitoring: stopSMSMonitoring, simulateIncomingSMS } = useSMSMonitor();

  const toggleAssistant = async () => {
    if (!isEnabled) {
      await startCallMonitoring();
      await startSMSMonitoring();
      setIsEnabled(true);
    } else {
      await stopCallMonitoring();
      await stopSMSMonitoring();
      setIsEnabled(false);
    }
  };

  const handleTestSMS = async () => {
    if (testSender && testMessage) {
      await simulateIncomingSMS(testSender, testMessage);
      setTestSender('');
      setTestMessage('');
    }
  };

  const handleTestMissedCall = async () => {
    const response = await sendAIResponse('missed_call');
    if (response?.autoResponse) {
      alert(`Auto-response generated: ${response.autoResponse}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Control */}
      <Card className="shadow-lg border-0" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-3 text-xl"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.2)'
              }}
            >
              <Smartphone className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            </div>
            Smart Communication Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
                AI Assistant Status
              </p>
              <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm">
                Monitors calls and SMS for smart responses
              </p>
            </div>
            <Button
              onClick={toggleAssistant}
              className={`shadow-md hover:shadow-lg transition-all duration-200 ${
                isEnabled 
                  ? 'hover:bg-red-600' 
                  : 'hover:bg-green-600'
              }`}
              style={{
                backgroundColor: isEnabled ? '#ef4444' : 'hsl(var(--app-accent))'
              }}
            >
              {isEnabled ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg" 
                 style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}>
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Call Monitoring:</span>
              <Badge variant={callState.isListening ? 'default' : 'secondary'}>
                {callState.isListening ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" 
                 style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}>
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>SMS Monitoring:</span>
              <Badge variant={smsState.isMonitoring ? 'default' : 'secondary'}>
                {smsState.isMonitoring ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Status */}
      <Card className="shadow-lg border-0" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-3"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <Phone className="w-5 h-5" />
            Call Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ color: 'hsl(var(--app-text-primary))' }}>Currently on call:</span>
            <Badge variant={callState.isOnCall ? 'destructive' : 'secondary'}>
              {callState.isOnCall ? 'Yes' : 'No'}
            </Badge>
          </div>
          {callState.callStartTime && (
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Call started:</span>
              <span style={{ color: 'hsl(var(--app-text-secondary))' }}>
                {callState.callStartTime.toLocaleTimeString()}
              </span>
            </div>
          )}
          {callState.lastCallEndTime && (
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Last call ended:</span>
              <span style={{ color: 'hsl(var(--app-text-secondary))' }}>
                {callState.lastCallEndTime.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          <Button 
            onClick={handleTestMissedCall}
            variant="outline"
            className="w-full mt-4"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Test Missed Call Response
          </Button>
        </CardContent>
      </Card>

      {/* SMS Monitor */}
      <Card className="shadow-lg border-0" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-3"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <MessageSquare className="w-5 h-5" />
            SMS Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span style={{ color: 'hsl(var(--app-text-primary))' }}>Messages monitored:</span>
            <Badge>{smsState.messages.length}</Badge>
          </div>

          {/* Test SMS Form */}
          <div className="space-y-3 p-4 rounded-lg" 
               style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}>
            <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
              Test SMS Response
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Sender name"
                value={testSender}
                onChange={(e) => setTestSender(e.target.value)}
                style={{
                  backgroundColor: 'hsl(var(--app-surface))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--app-text-primary))'
                }}
              />
              <Input
                placeholder="Message content"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                style={{
                  backgroundColor: 'hsl(var(--app-surface))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--app-text-primary))'
                }}
              />
              <Button 
                onClick={handleTestSMS}
                disabled={!testSender || !testMessage}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Test SMS
              </Button>
            </div>
          </div>

          {/* Recent Messages */}
          {smsState.messages.length > 0 && (
            <div className="space-y-2">
              <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
                Recent Messages
              </p>
              {smsState.messages.slice(0, 3).map((message) => (
                <div key={message.id} 
                     className="p-3 rounded-lg border"
                     style={{ 
                       backgroundColor: 'rgba(79, 70, 229, 0.05)',
                       borderColor: 'rgba(79, 70, 229, 0.1)'
                     }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
                      {message.sender}
                    </span>
                    <Badge variant={message.responded ? 'default' : 'secondary'}>
                      {message.responded ? 'Responded' : 'Pending'}
                    </Badge>
                  </div>
                  <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm">
                    {message.content}
                  </p>
                  <span style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-xs">
                    {message.timestamp.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Info */}
      <Card className="shadow-lg border-0" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-3"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <Bell className="w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
              📱 Call Monitoring
            </p>
            <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm">
              Detects when you're on calls and generates helpful post-call suggestions
            </p>
          </div>
          <div className="space-y-2">
            <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
              💬 SMS Intelligence
            </p>
            <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm">
              Analyzes incoming messages and suggests smart auto-responses
            </p>
          </div>
          <div className="space-y-2">
            <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
              🤖 AI Responses
            </p>
            <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm">
              Context-aware responses powered by OpenAI for professional communication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartCommunicationAssistant;