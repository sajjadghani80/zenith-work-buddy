
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        console.log('Speech result:', speechResult);
        setTranscript(speechResult);
        
        // Generate AI response
        const aiResponse = simulateVoiceResponse(speechResult);
        setResponse(aiResponse);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setResponse('Microphone access denied. Please allow microphone access and try again.');
        } else {
          setResponse('Speech recognition error. Please try again.');
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const simulateVoiceResponse = (userInput: string) => {
    const responses = {
      'schedule': 'I can help you schedule a meeting. What time works best for you?',
      'meeting': 'You have 3 meetings today. Would you like me to show you the details?',
      'tasks': 'You have 5 pending tasks. Shall I prioritize them for you?',
      'task': 'You have 5 pending tasks. Shall I prioritize them for you?',
      'calls': 'You have 2 missed calls. Would you like me to call them back?',
      'call': 'You have 2 missed calls. Would you like me to call them back?',
      'messages': 'You have 8 unread messages. Shall I summarize them?',
      'message': 'You have 8 unread messages. Shall I summarize them?',
      'help': 'I can help you with meetings, tasks, calls, messages, and scheduling. What would you like to do?',
      'default': 'I\'m here to help! You can ask me about meetings, tasks, calls, or messages.'
    };

    const lowercaseInput = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowercaseInput.includes(key)) {
        return response;
      }
    }
    return `I heard you say: "${userInput}". ${responses.default}`;
  };

  const handleVoiceCommand = async () => {
    if (!isSupported) {
      setResponse('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // Start listening
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Clear previous results
        setTranscript('');
        setResponse('');
        
        // Start recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error('Microphone access error:', error);
        setResponse('Microphone access is required for voice commands. Please allow access and try again.');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <Card className="bg-red-500/20 backdrop-blur-lg border-red-300/20 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Voice Recognition Not Supported</h3>
            <p className="text-red-200">
              Your browser doesn't support Web Speech API. Please use Chrome, Edge, or Safari for voice features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              ? 'Speak now! Say something like "Show my meetings" or "What tasks do I have?"'
              : 'Your AI assistant is ready to listen and help with scheduling, tasks, and more'
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
          <h4 className="font-semibold mb-3">Try saying:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm text-purple-200">
            <p>• "Show my meetings today"</p>
            <p>• "What tasks do I have?"</p>
            <p>• "Any missed calls?"</p>
            <p>• "Check my messages"</p>
            <p>• "Schedule a meeting"</p>
            <p>• "Help me"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
