
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const simulateVoiceResponse = (userInput: string) => {
    const responses = {
      'schedule': 'I can help you schedule a meeting. What time works best for you?',
      'meeting': 'You have 3 meetings today. Would you like me to show you the details?',
      'tasks': 'You have 5 pending tasks. Shall I prioritize them for you?',
      'calls': 'You have 2 missed calls. Would you like me to call them back?',
      'messages': 'You have 8 unread messages. Shall I summarize them?',
      'default': 'I\'m here to help! You can ask me about meetings, tasks, calls, or messages.'
    };

    const lowercaseInput = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowercaseInput.includes(key)) {
        return response;
      }
    }
    return responses.default;
  };

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        const sampleCommands = [
          'Show me my meetings today',
          'What tasks do I have?',
          'Schedule a meeting with the team',
          'Check my messages',
          'Any missed calls?'
        ];
        const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        setTranscript(randomCommand);
        
        setTimeout(() => {
          const aiResponse = simulateVoiceResponse(randomCommand);
          setResponse(aiResponse);
          setIsListening(false);
        }, 1000);
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Voice Control Interface */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Button
              onClick={handleVoiceCommand}
              className={`w-20 h-20 rounded-full mx-auto ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </h3>
          
          <p className="text-purple-200 text-sm">
            {isListening 
              ? 'Say something like "Show my meetings" or "What tasks do I have?"'
              : 'Your AI assistant is ready to help with scheduling, tasks, and more'
            }
          </p>
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {transcript && (
        <Card className="bg-blue-500/20 backdrop-blur-lg border-blue-300/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold">You said:</h4>
                <p className="text-blue-200">{transcript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {response && (
        <Card className="bg-purple-500/20 backdrop-blur-lg border-purple-300/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold">Assistant:</h4>
                <p className="text-purple-200">{response}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Commands */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Quick Commands:</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10 text-xs"
              onClick={() => {
                setTranscript('Show my meetings today');
                setResponse(simulateVoiceResponse('Show my meetings today'));
              }}
            >
              "Show meetings"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10 text-xs"
              onClick={() => {
                setTranscript('What tasks do I have?');
                setResponse(simulateVoiceResponse('What tasks do I have?'));
              }}
            >
              "My tasks"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10 text-xs"
              onClick={() => {
                setTranscript('Any missed calls?');
                setResponse(simulateVoiceResponse('Any missed calls?'));
              }}
            >
              "Missed calls"
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/20 text-white hover:bg-white/10 text-xs"
              onClick={() => {
                setTranscript('Check messages');
                setResponse(simulateVoiceResponse('Check messages'));
              }}
            >
              "Messages"
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
