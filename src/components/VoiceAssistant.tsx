
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true; // Show interim results
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError('');
        setResponse('');
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('Final transcript:', finalTranscript);
        console.log('Interim transcript:', interimTranscript);
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          
          // Generate AI response
          const aiResponse = simulateVoiceResponse(finalTranscript);
          setResponse(aiResponse);
          
          // Stop listening after getting a result
          recognition.stop();
        } else if (interimTranscript) {
          setTranscript(interimTranscript + ' (listening...)');
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please speak louder and try again.');
          // Automatically restart listening for no-speech errors
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
                setError('');
              } catch (e) {
                console.log('Recognition restart failed:', e);
              }
            }
          }, 1000);
        } else if (event.error === 'audio-capture') {
          setError('No microphone found. Please check your microphone connection.');
        } else if (event.error === 'network') {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(`Speech recognition error: ${event.error}. Please try again.`);
        }
        
        setIsListening(false);
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
      setError('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
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
        setError('');
        
        // Start recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error('Microphone access error:', error);
        setError('Microphone access is required for voice commands. Please allow access and try again.');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-6 text-center">
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'hsl(var(--app-text-primary))' }}
            >
              Voice Recognition Not Supported
            </h3>
            <p style={{ color: 'hsl(var(--app-text-secondary))' }}>
              Your browser doesn't support Web Speech API. Please use Chrome, Edge, or Safari for voice features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Control Interface */}
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 20px 50px rgba(79, 70, 229, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Button
              onClick={handleVoiceCommand}
              className={`w-24 h-24 rounded-full mx-auto shadow-lg transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-200' 
                  : ''
              }`}
              style={{
                backgroundColor: isListening ? undefined : 'hsl(var(--app-primary))',
                boxShadow: isListening 
                  ? '0 0 0 0 rgba(239, 68, 68, 0.7)' 
                  : '0 10px 30px rgba(79, 70, 229, 0.3), 0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
          </div>
          
          <h3 
            className="text-2xl font-bold mb-3"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            {isListening ? 'Listening... Speak now!' : 'Tap to speak'}
          </h3>
          
          <p 
            className="text-base"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            {isListening 
              ? 'I\'m actively listening. Speak clearly and say something like "Show my meetings"'
              : 'Your AI assistant is ready to listen and help with scheduling, tasks, and more'
            }
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <MicOff className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h4 
                  className="font-semibold"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  Error:
                </h4>
                <p style={{ color: 'hsl(var(--app-text-secondary))' }}>{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript Display */}
      {transcript && (
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            backgroundColor: 'hsl(var(--app-surface))',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(79, 70, 229, 0.15)' }}
              >
                <Mic className="w-4 h-4" style={{ color: 'hsl(var(--app-primary))' }} />
              </div>
              <div>
                <h4 
                  className="font-semibold"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  You said:
                </h4>
                <p style={{ color: 'hsl(var(--app-text-secondary))' }}>{transcript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {response && (
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            backgroundColor: 'hsl(var(--app-surface))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
              >
                <Volume2 className="w-4 h-4" style={{ color: 'hsl(var(--app-accent))' }} />
              </div>
              <div>
                <h4 
                  className="font-semibold"
                  style={{ color: 'hsl(var(--app-text-primary))' }}
                >
                  Assistant:
                </h4>
                <p style={{ color: 'hsl(var(--app-text-secondary))' }}>{response}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Commands */}
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent className="p-6">
          <h4 
            className="font-semibold mb-4 text-lg"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            Try saying:
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Show my meetings today"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "What tasks do I have?"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Any missed calls?"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Check my messages"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Schedule a meeting"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Help me"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
