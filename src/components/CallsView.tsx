
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calls</h1>
          <p className="text-purple-200">AI call management with Twilio</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">AI Assistant:</span>
          <Button
            onClick={() => setAiCallsEnabled(!aiCallsEnabled)}
            className={`${aiCallsEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            {aiCallsEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Twilio Configuration Status */}
      <Card className={`${isConfigured ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20' : 'bg-gradient-to-r from-red-500/20 to-orange-500/20'} backdrop-blur-lg border-white/20 text-white mb-6`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Twilio Voice API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Voice API Status:</span>
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto-answer calls:</span>
              <div className={`w-3 h-3 rounded-full ${isConfigured && aiCallsEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            {isConfigured && (
              <div className="text-sm bg-blue-500/10 p-3 rounded-lg">
                <p><strong>Webhook URL:</strong></p>
                <p className="font-mono text-xs break-all">{getWebhookUrl()}</p>
                <p className="mt-2 text-blue-200">Configure this URL in your Twilio phone number settings.</p>
              </div>
            )}
            {!isConfigured && (
              <div className="text-sm bg-red-500/10 p-3 rounded-lg">
                <p className="text-red-200">Twilio credentials not configured. Please set up:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
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
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-300" />
              Make Outbound Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={outboundNumber}
                onChange={(e) => setOutboundNumber(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Input
                type="text"
                value={outboundMessage}
                onChange={(e) => setOutboundMessage(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={handleMakeCall}
              disabled={twilioLoading || !outboundNumber.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Phone className="w-4 h-4 mr-2" />
              {twilioLoading ? 'Calling...' : 'Make Call'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Call Status */}
      <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg border-white/20 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-green-300" />
            AI Call Assistant Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Auto-answer when busy:</span>
              <div className={`w-3 h-3 rounded-full ${aiCallsEnabled && isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Voice recognition:</span>
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Message transcription:</span>
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          </div>
          <p className="text-sm text-green-200 mt-4">
            {aiCallsEnabled && isConfigured
              ? 'Your AI assistant will answer calls when you\'re unavailable and take detailed messages.'
              : 'AI call assistance requires Twilio configuration.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-300" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {callsLoading ? (
            <div className="text-center py-4">Loading calls...</div>
          ) : calls.length === 0 ? (
            <div className="text-center py-4 text-gray-400">No calls yet</div>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
                  {getCallIcon(call.call_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{call.contact_name}</h3>
                    <span className="text-xs text-gray-400">
                      {new Date(call.call_time).toLocaleString()}
                    </span>
                  </div>
                  {call.phone_number && (
                    <p className="text-sm text-gray-300">{call.phone_number}</p>
                  )}
                  {call.duration && (
                    <p className="text-xs text-blue-300">Duration: {formatDuration(call.duration)}</p>
                  )}
                  {call.notes && (
                    <p className="text-xs text-green-300 mt-1">🤖 {call.notes}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Phone className="w-4 h-4" />
                  </Button>
                  {call.notes && (
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mt-6">
        <CardHeader>
          <CardTitle>AI Call Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Auto-answer after rings:</span>
            <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white">
              <option value="3">3 rings</option>
              <option value="4">4 rings</option>
              <option value="5">5 rings</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Voice personality:</span>
            <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white">
              <option value="alice">Alice (Female)</option>
              <option value="man">Man (Male)</option>
              <option value="woman">Woman (Female)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Language:</span>
            <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white">
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
