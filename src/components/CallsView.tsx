
import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCalls } from '@/hooks/useCalls';
import { useTwilioVoice } from '@/hooks/useTwilioVoice';

const CallsView = () => {
  const [aiCallsEnabled, setAiCallsEnabled] = useState(true);
  const [outboundNumber, setOutboundNumber] = useState('');
  const [outboundMessage, setOutboundMessage] = useState('Hello, this is an automated message from your AI assistant.');
  
  const { calls, isLoading: callsLoading } = useCalls();
  const { isConfigured, isLoading: twilioLoading, makeCall, getWebhookUrl, checkConfiguration } = useTwilioVoice();

  useEffect(() => {
    checkConfiguration();
  }, [checkConfiguration]);

  const handleMakeCall = async () => {
    if (!outboundNumber.trim()) {
      return;
    }
    
    await makeCall(outboundNumber, outboundMessage);
    setOutboundNumber('');
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'missed':
        return <PhoneOff className="w-4 h-4 text-red-400" />;
      case 'incoming':
        return <Phone className="w-4 h-4 text-green-400" />;
      case 'outgoing':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="min-h-screen p-6 pb-24"
      style={{ backgroundColor: 'hsl(var(--app-background))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            Calls
          </h1>
          <p 
            className="text-lg"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            AI call management with Twilio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            AI Assistant:
          </span>
          <Button
            onClick={() => setAiCallsEnabled(!aiCallsEnabled)}
            className={`shadow-md hover:shadow-lg transition-all duration-200 ${
              aiCallsEnabled 
                ? 'hover:bg-green-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            style={{
              backgroundColor: aiCallsEnabled ? 'hsl(var(--app-accent))' : undefined
            }}
          >
            {aiCallsEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Twilio Configuration Status */}
      <Card 
        className="shadow-lg border-0 mb-6" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          boxShadow: isConfigured 
            ? '0 10px 25px rgba(16, 185, 129, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
            : '0 10px 25px rgba(245, 158, 11, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
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
              <Settings className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            </div>
            Twilio Voice API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Voice API Status:</span>
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConfigured ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Auto-answer calls:</span>
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConfigured && aiCallsEnabled ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            </div>
            {isConfigured && (
              <div 
                className="text-sm p-4 rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  border: '1px solid rgba(79, 70, 229, 0.2)'
                }}
              >
                <p 
                  className="font-semibold mb-2"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  Webhook URL:
                </p>
                <p 
                  className="font-mono text-xs break-all mb-2"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  {getWebhookUrl()}
                </p>
                <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
                  Configure this URL in your Twilio phone number settings.
                </p>
              </div>
            )}
            {!isConfigured && (
              <div 
                className="text-sm p-4 rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <p 
                  className="mb-2"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  Twilio credentials not configured. Please set up:
                </p>
                <ul 
                  className="list-disc list-inside space-y-1"
                  style={{ color: 'hsl(var(--app-text-secondary))' }}
                >
                  <li>TWILIO_ACCOUNT_SID</li>
                  <li>TWILIO_AUTH_TOKEN</li>
                  <li>TWILIO_PHONE_NUMBER</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Make Outbound Call */}
      {isConfigured && (
        <Card 
          className="shadow-lg border-0 mb-6" 
          style={{ 
            backgroundColor: 'hsl(var(--app-surface))',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
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
                <PhoneCall className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
              </div>
              Make Outbound Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'hsl(var(--app-text-primary))' }}
              >
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={outboundNumber}
                onChange={(e) => setOutboundNumber(e.target.value)}
                className="shadow-sm border-gray-300 focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: 'hsl(var(--app-surface))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--app-text-primary))'
                }}
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'hsl(var(--app-text-primary))' }}
              >
                Message
              </label>
              <Input
                type="text"
                value={outboundMessage}
                onChange={(e) => setOutboundMessage(e.target.value)}
                className="shadow-sm border-gray-300 focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: 'hsl(var(--app-surface))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--app-text-primary))'
                }}
              />
            </div>
            <Button
              onClick={handleMakeCall}
              disabled={twilioLoading || !outboundNumber.trim()}
              className="shadow-md hover:shadow-lg transition-all duration-200"
              style={{
                backgroundColor: 'hsl(var(--app-primary))',
                borderColor: 'hsl(var(--app-primary))'
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              {twilioLoading ? 'Calling...' : 'Make Call'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Call Status */}
      <Card 
        className="shadow-lg border-0 mb-6" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-3 text-xl"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <Mic className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
            </div>
            AI Call Assistant Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Auto-answer when busy:</span>
              <div 
                className={`w-3 h-3 rounded-full ${
                  aiCallsEnabled && isConfigured ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Voice recognition:</span>
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConfigured ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'hsl(var(--app-text-primary))' }}>Message transcription:</span>
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConfigured ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            </div>
          </div>
          <p 
            className="text-sm mt-4"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            {aiCallsEnabled && isConfigured
              ? 'Your AI assistant will answer calls when you\'re unavailable and take detailed messages.'
              : 'AI call assistance requires Twilio configuration.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card 
        className="shadow-lg border-0 mb-6" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
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
              <Phone className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            </div>
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {callsLoading ? (
            <div 
              className="text-center py-8"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              Loading calls...
            </div>
          ) : calls.length === 0 ? (
            <div 
              className="text-center py-8"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              No calls yet
            </div>
          ) : (
            calls.map((call) => (
              <div 
                key={call.id} 
                className="flex items-center gap-4 p-4 rounded-xl hover:shadow-md transition-all duration-200 shadow-sm"
                style={{ 
                  backgroundColor: 'rgba(79, 70, 229, 0.05)',
                  border: '1px solid rgba(79, 70, 229, 0.1)'
                }}
              >
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
                  style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                >
                  {getCallIcon(call.call_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 
                      className="font-semibold text-base"
                      style={{ color: 'hsl(var(--app-text-primary))' }}
                    >
                      {call.contact_name}
                    </h3>
                    <span 
                      className="text-xs"
                      style={{ color: 'hsl(var(--app-text-secondary))' }}
                    >
                      {new Date(call.call_time).toLocaleString()}
                    </span>
                  </div>
                  {call.phone_number && (
                    <p 
                      className="text-sm mb-1"
                      style={{ color: 'hsl(var(--app-text-secondary))' }}
                    >
                      {call.phone_number}
                    </p>
                  )}
                  {call.duration && (
                    <p className="text-xs text-blue-500 mb-1">
                      Duration: {formatDuration(call.duration)}
                    </p>
                  )}
                  {call.notes && (
                    <p 
                      className="text-xs mt-2 p-2 rounded-lg"
                      style={{ 
                        color: 'hsl(var(--app-accent))',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)'
                      }}
                    >
                      🤖 {call.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="shadow-sm hover:shadow-md transition-all duration-200"
                    style={{
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--app-text-primary))'
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  {call.notes && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--app-text-primary))'
                      }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Call Settings */}
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardHeader>
          <CardTitle 
            className="text-xl"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            AI Call Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span style={{ color: 'hsl(var(--app-text-primary))' }}>Auto-answer after rings:</span>
            <select 
              className="shadow-sm rounded-lg px-3 py-2 border"
              style={{
                backgroundColor: 'hsl(var(--app-surface))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--app-text-primary))'
              }}
            >
              <option value="3">3 rings</option>
              <option value="4">4 rings</option>
              <option value="5">5 rings</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'hsl(var(--app-text-primary))' }}>Voice personality:</span>
            <select 
              className="shadow-sm rounded-lg px-3 py-2 border"
              style={{
                backgroundColor: 'hsl(var(--app-surface))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--app-text-primary))'
              }}
            >
              <option value="alice">Alice (Female)</option>
              <option value="man">Man (Male)</option>
              <option value="woman">Woman (Female)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'hsl(var(--app-text-primary))' }}>Language:</span>
            <select 
              className="shadow-sm rounded-lg px-3 py-2 border"
              style={{
                backgroundColor: 'hsl(var(--app-surface))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--app-text-primary))'
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallsView;
