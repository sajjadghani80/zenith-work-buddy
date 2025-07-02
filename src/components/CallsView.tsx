
import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CallsView = () => {
  const [aiCallsEnabled, setAiCallsEnabled] = useState(true);

  const recentCalls = [
    {
      id: 1,
      name: 'John Smith',
      number: '+1 (555) 123-4567',
      type: 'missed',
      time: '10 minutes ago',
      duration: null,
      aiHandled: true,
      message: 'AI took message: Wants to discuss project timeline'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      number: '+1 (555) 987-6543',
      type: 'incoming',
      time: '1 hour ago',
      duration: '12 min',
      aiHandled: false,
      message: null
    },
    {
      id: 3,
      name: 'Unknown',
      number: '+1 (555) 456-7890',
      type: 'missed',
      time: '2 hours ago',
      duration: null,
      aiHandled: true,
      message: 'AI responded: Sales call, marked as spam'
    },
    {
      id: 4,
      name: 'Mike Johnson',
      number: '+1 (555) 234-5678',
      type: 'outgoing',
      time: '3 hours ago',
      duration: '8 min',
      aiHandled: false,
      message: null
    }
  ];

  const aiMessages = [
    {
      id: 1,
      caller: 'John Smith',
      message: 'Hi, this is John calling about the project timeline. Could you please call me back when you get a chance? My number is 555-123-4567. Thanks!',
      time: '10 minutes ago',
      priority: 'high'
    },
    {
      id: 2,
      caller: 'Marketing Agency',
      message: 'This was a sales call. I informed them you are not interested and asked to be removed from their list.',
      time: '2 hours ago',
      priority: 'low'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calls</h1>
          <p className="text-purple-200">AI call management</p>
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
              <div className={`w-3 h-3 rounded-full ${aiCallsEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Voice recognition:</span>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Message transcription:</span>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <p className="text-sm text-green-200 mt-4">
            {aiCallsEnabled 
              ? 'Your AI assistant will answer calls when you\'re unavailable and take detailed messages.'
              : 'AI call assistance is disabled. Calls will go to voicemail.'
            }
          </p>
        </CardContent>
      </Card>

      {/* AI Messages */}
      {aiMessages.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-300" />
              AI Call Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{msg.caller}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      msg.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {msg.priority} priority
                    </span>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">{msg.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                    Call Back
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Add to Tasks
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Calls */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-300" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentCalls.map((call) => (
            <div key={call.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
                {getCallIcon(call.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{call.name}</h3>
                  <span className="text-xs text-gray-400">{call.time}</span>
                </div>
                <p className="text-sm text-gray-300">{call.number}</p>
                {call.duration && (
                  <p className="text-xs text-blue-300">Duration: {call.duration}</p>
                )}
                {call.aiHandled && call.message && (
                  <p className="text-xs text-green-300 mt-1">🤖 {call.message}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Phone className="w-4 h-4" />
                </Button>
                {call.aiHandled && call.message && (
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
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
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="brief">Brief & Direct</option>
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
