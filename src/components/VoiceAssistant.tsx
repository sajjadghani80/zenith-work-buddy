
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useMeetings } from '@/hooks/useMeetings';
import { useMessages } from '@/hooks/useMessages';
import { useCalls } from '@/hooks/useCalls';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { format, isToday } from 'date-fns';

interface ConversationEntry {
  timestamp: Date;
  userInput: string;
  aiResponse: string;
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const recognitionRef = useRef<any>(null);
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get real data from hooks
  const { tasks } = useTasks();
  const { meetings } = useMeetings();
  const { messages } = useMessages();
  const { calls } = useCalls();
  const { speak, isSpeaking, error: speechError } = useTextToSpeech();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError('');
      };
      
      recognition.onresult = async (event: any) => {
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
        
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          setTranscript(finalTranscript);
          
          const aiResponse = generateSmartResponse(finalTranscript, conversationHistory, {
            tasks,
            meetings,
            messages,
            calls
          });
          
          setResponse(aiResponse);
          
          const newEntry: ConversationEntry = {
            timestamp: new Date(),
            userInput: finalTranscript,
            aiResponse: aiResponse
          };
          setConversationHistory(prev => [...prev.slice(-4), newEntry]);
          
          // Speak the response
          await handleVoiceResponse(aiResponse);
          
        } else if (interimTranscript) {
          setTranscript(interimTranscript + ' (listening...)');
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
          setIsConversationMode(false);
        } else if (event.error === 'no-speech') {
          if (isConversationMode) {
            // In conversation mode, restart listening after a brief delay
            setTimeout(() => {
              if (isConversationMode && !isSpeaking) {
                startListening();
              }
            }, 1000);
          } else {
            setError('No speech detected. Please speak louder and try again.');
          }
        } else if (event.error === 'audio-capture') {
          setError('No microphone found. Please check your microphone connection.');
          setIsConversationMode(false);
        } else if (event.error === 'network') {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(`Speech recognition error: ${event.error}. Please try again.`);
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
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
      }
    };
  }, [conversationHistory, tasks, meetings, messages, calls, isConversationMode, isSpeaking]);

  const generateSmartResponse = (userInput: string, history: ConversationEntry[], realData: any) => {
    const lowercaseInput = userInput.toLowerCase();
    
    // Build context from recent conversation
    const recentContext = history.slice(-3).map(entry => 
      `User: ${entry.userInput} | AI: ${entry.aiResponse}`
    ).join(' | ');
    
    console.log('Conversation context:', recentContext);
    
    // Get real data counts
    const pendingTasks = realData.tasks?.filter((task: any) => !task.completed) || [];
    const todaysTasks = pendingTasks.filter((task: any) => 
      task.due_date ? isToday(new Date(task.due_date)) : false
    );
    const todaysMeetings = realData.meetings?.filter((meeting: any) =>
      isToday(new Date(meeting.start_time))
    ) || [];
    const unreadMessages = realData.messages?.filter((msg: any) => !msg.is_read) || [];
    const missedCalls = realData.calls?.filter((call: any) => call.call_type === 'missed') || [];
    
    // Context-aware responses with real data
    if (lowercaseInput.includes('that') || lowercaseInput.includes('it') || lowercaseInput.includes('them')) {
      const lastEntry = history[history.length - 1];
      if (lastEntry) {
        if (lastEntry.userInput.toLowerCase().includes('meeting') || lastEntry.aiResponse.toLowerCase().includes('meeting')) {
          if (lowercaseInput.includes('schedule') || lowercaseInput.includes('set up')) {
            return 'I\'ll help you schedule those meetings we just discussed. What time works best for you?';
          }
          if (lowercaseInput.includes('cancel') || lowercaseInput.includes('remove')) {
            return 'I can help you cancel those meetings. Which specific meeting would you like me to cancel?';
          }
          if (lowercaseInput.includes('details') || lowercaseInput.includes('more')) {
            if (todaysMeetings.length > 0) {
              const meetingDetails = todaysMeetings.map((meeting: any, index: number) => 
                `Meeting ${index + 1}: ${meeting.title} at ${format(new Date(meeting.start_time), 'h:mm a')}`
              ).join(', ');
              return `Here are your meeting details: ${meetingDetails}`;
            }
            return 'You don\'t have any meetings scheduled for today.';
          }
        }
        
        if (lastEntry.userInput.toLowerCase().includes('task') || lastEntry.aiResponse.toLowerCase().includes('task')) {
          if (lowercaseInput.includes('prioritize') || lowercaseInput.includes('organize')) {
            if (pendingTasks.length > 0) {
              const highPriorityTasks = pendingTasks.filter((t: any) => t.priority === 'high');
              const mediumPriorityTasks = pendingTasks.filter((t: any) => t.priority === 'medium');
              const lowPriorityTasks = pendingTasks.filter((t: any) => t.priority === 'low');
              
              let priorityResponse = 'Here\'s your task priority breakdown: ';
              if (highPriorityTasks.length > 0) priorityResponse += `${highPriorityTasks.length} high priority, `;
              if (mediumPriorityTasks.length > 0) priorityResponse += `${mediumPriorityTasks.length} medium priority, `;
              if (lowPriorityTasks.length > 0) priorityResponse += `${lowPriorityTasks.length} low priority tasks. `;
              
              return priorityResponse + 'Focus on high priority tasks first!';
            }
            return 'You don\'t have any pending tasks to prioritize.';
          }
          if (lowercaseInput.includes('complete') || lowercaseInput.includes('done')) {
            return 'Great! Which specific task have you completed? I can help you mark it as done.';
          }
        }
      }
      
      return `Based on our previous conversation about "${lastEntry?.userInput || 'your request'}", I can help you with that. What specifically would you like me to do?`;
    }
    
    // Task-related queries with real data - differentiate between count and detail requests
    if (lowercaseInput.includes('task')) {
      // Count requests
      if (lowercaseInput.includes('how many') || lowercaseInput.includes('number') || lowercaseInput.includes('count')) {
        if (lowercaseInput.includes('today')) {
          return `You have ${todaysTasks.length} task${todaysTasks.length !== 1 ? 's' : ''} due today.`;
        }
        return `You have ${pendingTasks.length} pending task${pendingTasks.length !== 1 ? 's' : ''} total.`;
      }
      
      // Detail requests
      if (lowercaseInput.includes('show') || lowercaseInput.includes('list') || lowercaseInput.includes('open')) {
        if (lowercaseInput.includes('today')) {
          if (todaysTasks.length > 0) {
            const taskDetails = todaysTasks.map((task: any, index: number) => 
              `${index + 1}. ${task.title}${task.description ? ` - ${task.description}` : ''} (Priority: ${task.priority})`
            ).join(', ');
            return `Here are your ${todaysTasks.length} task${todaysTasks.length !== 1 ? 's' : ''} due today: ${taskDetails}`;
          } else if (pendingTasks.length > 0) {
            const taskDetails = pendingTasks.slice(0, 3).map((task: any, index: number) => 
              `${index + 1}. ${task.title}${task.description ? ` - ${task.description}` : ''} (Priority: ${task.priority})`
            ).join(', ');
            return `You don't have tasks due today, but here are your first 3 pending tasks: ${taskDetails}${pendingTasks.length > 3 ? ` and ${pendingTasks.length - 3} more.` : ''}`;
          }
          return 'You don\'t have any tasks due today. Great job staying on top of things!';
        }
        
        if (pendingTasks.length > 0) {
          const taskDetails = pendingTasks.slice(0, 5).map((task: any, index: number) => 
            `${index + 1}. ${task.title}${task.description ? ` - ${task.description}` : ''} (Priority: ${task.priority}${task.due_date ? `, Due: ${format(new Date(task.due_date), 'MMM d')}` : ''})`
          ).join(', ');
          return `Here are your pending tasks: ${taskDetails}${pendingTasks.length > 5 ? ` and ${pendingTasks.length - 5} more.` : ''}`;
        }
        return 'You don\'t have any pending tasks. You\'re all caught up!';
      }
      
      // General task query
      if (lowercaseInput.includes('today')) {
        if (todaysTasks.length > 0) {
          return `You have ${todaysTasks.length} task${todaysTasks.length !== 1 ? 's' : ''} due today. Would you like me to list them with details?`;
        } else if (pendingTasks.length > 0) {
          return `You don't have any tasks specifically due today, but you have ${pendingTasks.length} pending task${pendingTasks.length !== 1 ? 's' : ''} overall. Would you like to see them?`;
        }
        return 'You don\'t have any tasks due today. Great job staying on top of things!';
      }
      
      if (pendingTasks.length > 0) {
        const highPriorityCount = pendingTasks.filter((t: any) => t.priority === 'high').length;
        return `You have ${pendingTasks.length} pending task${pendingTasks.length !== 1 ? 's' : ''}${highPriorityCount > 0 ? ` (${highPriorityCount} high priority)` : ''}. Say "show my tasks" to see details or "how many tasks" for just the count.`;
      }
      return 'You don\'t have any pending tasks. You\'re all caught up!';
    }

    // Meeting-related queries with real data
    if (lowercaseInput.includes('meeting')) {
      // Count requests
      if (lowercaseInput.includes('how many') || lowercaseInput.includes('number') || lowercaseInput.includes('count')) {
        return `You have ${todaysMeetings.length} meeting${todaysMeetings.length !== 1 ? 's' : ''} scheduled for today.`;
      }
      
      // Detail requests
      if (lowercaseInput.includes('show') || lowercaseInput.includes('list') || lowercaseInput.includes('open')) {
        if (todaysMeetings.length > 0) {
          const meetingDetails = todaysMeetings.map((meeting: any, index: number) => 
            `${index + 1}. ${meeting.title} at ${format(new Date(meeting.start_time), 'h:mm a')}${meeting.location ? ` (${meeting.location})` : ''}${meeting.description ? ` - ${meeting.description}` : ''}`
          ).join(', ');
          return `Here are your meetings today: ${meetingDetails}`;
        }
        return 'You don\'t have any meetings scheduled for today.';
      }
      
      // General meeting query
      if (todaysMeetings.length > 0) {
        return `You have ${todaysMeetings.length} meeting${todaysMeetings.length !== 1 ? 's' : ''} today. Say "show my meetings" for details or "how many meetings" for just the count.`;
      }
      return 'You don\'t have any meetings scheduled for today.';
    }

    // Message-related queries with real data
    if (lowercaseInput.includes('message')) {
      // Count requests
      if (lowercaseInput.includes('how many') || lowercaseInput.includes('number') || lowercaseInput.includes('count')) {
        return `You have ${unreadMessages.length} unread message${unreadMessages.length !== 1 ? 's' : ''}.`;
      }
      
      // Detail requests
      if (lowercaseInput.includes('show') || lowercaseInput.includes('list') || lowercaseInput.includes('open')) {
        if (unreadMessages.length > 0) {
          const messageDetails = unreadMessages.slice(0, 3).map((msg: any, index: number) => 
            `${index + 1}. From ${msg.sender_name}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''} (${msg.priority} priority)`
          ).join(', ');
          return `Here are your recent unread messages: ${messageDetails}${unreadMessages.length > 3 ? ` and ${unreadMessages.length - 3} more.` : ''}`;
        }
        return 'You don\'t have any unread messages. Your inbox is clean!';
      }
      
      // General message query
      if (unreadMessages.length > 0) {
        const highPriorityMessages = unreadMessages.filter((msg: any) => msg.priority === 'high').length;
        return `You have ${unreadMessages.length} unread message${unreadMessages.length !== 1 ? 's' : ''}${highPriorityMessages > 0 ? ` (${highPriorityMessages} high priority)` : ''}. Say "show my messages" for details.`;
      }
      return 'You don\'t have any unread messages. Your inbox is clean!';
    }

    // Call-related queries with real data
    if (lowercaseInput.includes('call')) {
      // Count requests
      if (lowercaseInput.includes('how many') || lowercaseInput.includes('number') || lowercaseInput.includes('count')) {
        return `You have ${missedCalls.length} missed call${missedCalls.length !== 1 ? 's' : ''}.`;
      }
      
      // Detail requests
      if (lowercaseInput.includes('show') || lowercaseInput.includes('list') || lowercaseInput.includes('open')) {
        if (missedCalls.length > 0) {
          const callDetails = missedCalls.slice(0, 3).map((call: any, index: number) => 
            `${index + 1}. ${call.contact_name}${call.phone_number ? ` (${call.phone_number})` : ''} at ${format(new Date(call.call_time), 'h:mm a')}`
          ).join(', ');
          return `Here are your recent missed calls: ${callDetails}${missedCalls.length > 3 ? ` and ${missedCalls.length - 3} more.` : ''}`;
        }
        return 'You don\'t have any missed calls.';
      }
      
      // General call query
      if (missedCalls.length > 0) {
        return `You have ${missedCalls.length} missed call${missedCalls.length !== 1 ? 's' : ''}. Say "show my calls" for details.`;
      }
      return 'You don\'t have any missed calls.';
    }

    // Help and default responses
    if (lowercaseInput.includes('help')) {
      return `I can help you with your tasks (${pendingTasks.length} pending), meetings (${todaysMeetings.length} today), messages (${unreadMessages.length} unread), and calls (${missedCalls.length} missed). Use "show" or "list" for details, "how many" for counts. I also remember our conversation context.`;
    }
    
    // Default response with real data context
    if (history.length > 0) {
      return `I heard you say: "${userInput}". I can help you with your tasks, meetings, messages, and calls. We were previously talking about ${history[history.length - 1].userInput.toLowerCase().includes('meeting') ? 'meetings' : history[history.length - 1].userInput.toLowerCase().includes('task') ? 'tasks' : 'your requests'}.`;
    }
    
    return `I heard you say: "${userInput}". I can help you with your ${pendingTasks.length} pending tasks, ${todaysMeetings.length} meetings today, ${unreadMessages.length} unread messages, and ${missedCalls.length} missed calls. Use "show" for details or "how many" for counts.`;
  };

  const handleVoiceResponse = async (responseText: string) => {
    try {
      console.log('Speaking response:', responseText);
      await speak(responseText);
      
      // In conversation mode, start listening again after speaking
      if (isConversationMode && !isSpeaking) {
        setTimeout(() => {
          if (isConversationMode) {
            startListening();
          }
        }, 500); // Small delay to ensure speech has finished
      }
    } catch (error) {
      console.error('Error speaking response:', error);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;

    try {
      setTranscript('');
      setError('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start listening. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceCommand = async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isConversationMode) {
      // Stop conversation mode
      setIsConversationMode(false);
      stopListening();
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
      }
    } else {
      // Start conversation mode
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsConversationMode(true);
        setError('');
        startListening();
      } catch (error) {
        console.error('Microphone access error:', error);
        setError('Microphone access is required for voice commands. Please allow access and try again.');
      }
    }
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
    setTranscript('');
    setResponse('');
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
                isConversationMode 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-200' 
                  : ''
              }`}
              style={{
                backgroundColor: isConversationMode ? undefined : 'hsl(var(--app-primary))',
                boxShadow: isConversationMode 
                  ? '0 0 0 0 rgba(239, 68, 68, 0.7)' 
                  : '0 10px 30px rgba(79, 70, 229, 0.3), 0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isConversationMode ? <MicOff className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
            </Button>
          </div>
          
          <h3 
            className="text-2xl font-bold mb-3"
            style={{ color: 'hsl(var(--app-text-primary))' }}
          >
            {isConversationMode 
              ? (isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Conversation Active')
              : 'Start Conversation'
            }
          </h3>
          
          <p 
            className="text-base mb-4"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            {isConversationMode 
              ? 'Having a real-time conversation with your AI assistant. Press the button to stop.'
              : 'Tap to start a continuous voice conversation with your AI assistant'
            }
          </p>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Volume2 className="w-5 h-5 animate-pulse" style={{ color: 'hsl(var(--app-accent))' }} />
              <p 
                className="text-sm animate-pulse"
                style={{ color: 'hsl(var(--app-accent))' }}
              >
                AI is speaking...
              </p>
            </div>
          )}

          {/* Memory Status */}
          {conversationHistory.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <p 
                className="text-sm px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: 'hsl(var(--app-accent))'
                }}
              >
                💭 {conversationHistory.length} conversation{conversationHistory.length !== 1 ? 's' : ''} remembered
              </p>
              <Button
                onClick={clearConversationHistory}
                size="sm"
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--app-text-secondary))'
                }}
              >
                Clear Memory
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || speechError) && (
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
                <p style={{ color: 'hsl(var(--app-text-secondary))' }}>{error || speechError}</p>
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

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
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
              Recent Conversation:
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversationHistory.slice(-3).map((entry, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        color: 'hsl(var(--app-primary))'
                      }}
                    >
                      You
                    </span>
                    <p 
                      className="text-sm"
                      style={{ color: 'hsl(var(--app-text-secondary))' }}
                    >
                      {entry.userInput}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'hsl(var(--app-accent))'
                      }}
                    >
                      AI
                    </span>
                    <p 
                      className="text-sm"
                      style={{ color: 'hsl(var(--app-text-secondary))' }}
                    >
                      {entry.aiResponse}
                    </p>
                  </div>
                  {index < conversationHistory.slice(-3).length - 1 && (
                    <hr 
                      className="my-3"
                      style={{ borderColor: 'hsl(var(--border))' }}
                    />
                  )}
                </div>
              ))}
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
              "What are my tasks for today?" (I'll check your real tasks)
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Show my meetings today" (I'll check your actual calendar)
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Any unread messages?" (I'll check your message count)
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Help me prioritize my tasks" (Based on your real task data)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
