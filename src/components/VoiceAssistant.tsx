import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useMeetings } from '@/hooks/useMeetings';
import { useMessages } from '@/hooks/useMessages';
import { useCalls } from '@/hooks/useCalls';
import { format, isToday, addDays } from 'date-fns';

interface ConversationEntry {
  timestamp: Date;
  userInput: string;
  aiResponse: string;
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const recognitionRef = useRef<any>(null);

  // Get real data from hooks
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { meetings, createMeeting, updateMeeting } = useMeetings();
  const { messages } = useMessages();
  const { calls } = useCalls();

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
          
          // Generate AI response with real data and actions
          const aiResponse = generateSmartResponse(finalTranscript, conversationHistory, {
            tasks,
            meetings,
            messages,
            calls,
            createTask,
            updateTask,
            deleteTask,
            createMeeting,
            updateMeeting
          });
          setResponse(aiResponse);
          
          // Add to conversation history
          const newEntry: ConversationEntry = {
            timestamp: new Date(),
            userInput: finalTranscript,
            aiResponse: aiResponse
          };
          setConversationHistory(prev => [...prev.slice(-4), newEntry]); // Keep last 5 exchanges
          
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
  }, [conversationHistory, tasks, meetings, messages, calls, createTask, updateTask, deleteTask, createMeeting, updateMeeting]);

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
    
    // Task creation commands
    if (lowercaseInput.includes('create task') || lowercaseInput.includes('add task') || lowercaseInput.includes('new task')) {
      const taskMatch = userInput.match(/(?:create|add|new)\s+task\s+(.+?)(?:\s+(?:due|by)\s+(.+?))?(?:\s+(?:priority|with)\s+(high|medium|low))?$/i);
      
      if (taskMatch) {
        const title = taskMatch[1]?.trim();
        const dueDateStr = taskMatch[2]?.trim();
        const priority = taskMatch[3]?.toLowerCase() || 'medium';
        
        if (title) {
          let dueDate = null;
          
          // Parse due date
          if (dueDateStr) {
            if (dueDateStr.toLowerCase().includes('today')) {
              dueDate = new Date().toISOString();
            } else if (dueDateStr.toLowerCase().includes('tomorrow')) {
              dueDate = addDays(new Date(), 1).toISOString();
            } else if (dueDateStr.toLowerCase().includes('next week')) {
              dueDate = addDays(new Date(), 7).toISOString();
            }
          }
          
          // Create the task
          realData.createTask.mutate({
            title,
            description: null,
            completed: false,
            priority: priority as 'low' | 'medium' | 'high',
            due_date: dueDate
          });
          
          return `I've created a new ${priority} priority task: "${title}"${dueDate ? ` due ${dueDateStr}` : ''}. The task has been added to your list.`;
        }
      }
      
      return 'I can help you create a task. Please say something like "Create task buy groceries due tomorrow with high priority" or "Add task call dentist".';
    }

    // Task deletion commands
    if (lowercaseInput.includes('delete task') || lowercaseInput.includes('remove task') || lowercaseInput.includes('complete task')) {
      const isComplete = lowercaseInput.includes('complete task');
      
      // Try to extract task name
      const taskMatch = userInput.match(/(?:delete|remove|complete)\s+task\s+(.+)$/i);
      
      if (taskMatch) {
        const taskName = taskMatch[1]?.trim().toLowerCase();
        
        // Find matching task
        const matchingTask = pendingTasks.find((task: any) => 
          task.title.toLowerCase().includes(taskName) || taskName.includes(task.title.toLowerCase())
        );
        
        if (matchingTask) {
          if (isComplete) {
            realData.updateTask.mutate({
              id: matchingTask.id,
              completed: true
            });
            return `Great! I've marked "${matchingTask.title}" as completed.`;
          } else {
            realData.deleteTask.mutate(matchingTask.id);
            return `I've deleted the task "${matchingTask.title}" from your list.`;
          }
        } else {
          if (pendingTasks.length > 0) {
            const taskList = pendingTasks.slice(0, 3).map((task: any, index: number) => 
              `${index + 1}. ${task.title}`
            ).join(', ');
            return `I couldn't find a task matching "${taskName}". Here are your current tasks: ${taskList}. Please be more specific.`;
          }
          return `I couldn't find a task matching "${taskName}". You don't have any pending tasks.`;
        }
      }
      
      if (pendingTasks.length > 0) {
        const taskList = pendingTasks.slice(0, 3).map((task: any, index: number) => 
          `${index + 1}. ${task.title}`
        ).join(', ');
        return `Which task would you like to ${isComplete ? 'complete' : 'delete'}? Here are your current tasks: ${taskList}`;
      }
      
      return "You don't have any pending tasks to manage.";
    }

    // Meeting creation commands
    if (lowercaseInput.includes('create meeting') || lowercaseInput.includes('add meeting') || lowercaseInput.includes('schedule meeting')) {
      const meetingMatch = userInput.match(/(?:create|add|schedule)\s+meeting\s+(.+?)(?:\s+(?:at|on)\s+(.+?))?(?:\s+(?:for|duration)\s+(\d+)\s*(?:hour|hr|minute|min)s?)?$/i);
      
      if (meetingMatch) {
        const title = meetingMatch[1]?.trim();
        const timeStr = meetingMatch[2]?.trim();
        const duration = meetingMatch[3] ? parseInt(meetingMatch[3]) : 60; // Default 60 minutes
        
        if (title) {
          let startTime = new Date();
          
          // Parse meeting time
          if (timeStr) {
            if (timeStr.toLowerCase().includes('today')) {
              // Default to next hour
              startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
            } else if (timeStr.toLowerCase().includes('tomorrow')) {
              startTime = addDays(new Date(), 1);
              startTime.setHours(9, 0, 0, 0); // 9 AM tomorrow
            } else {
              // Try to parse time like "2pm", "14:00", etc.
              const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
              if (timeMatch) {
                let hours = parseInt(timeMatch[1]);
                const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
                const ampm = timeMatch[3]?.toLowerCase();
                
                if (ampm === 'pm' && hours !== 12) hours += 12;
                if (ampm === 'am' && hours === 12) hours = 0;
                
                startTime.setHours(hours, minutes, 0, 0);
              }
            }
          } else {
            // Default to next hour
            startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
          }
          
          const endTime = new Date(startTime.getTime() + duration * 60000);
          
          // Create the meeting
          realData.createMeeting.mutate({
            title,
            description: null,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            location: null,
            attendees: [],
            status: 'scheduled'
          });
          
          return `I've scheduled a meeting "${title}" for ${format(startTime, 'MMM d, h:mm a')} - ${format(endTime, 'h:mm a')}. The meeting has been added to your calendar.`;
        }
      }
      
      return 'I can help you schedule a meeting. Please say something like "Create meeting team standup at 2pm tomorrow" or "Schedule meeting client call for 60 minutes".';
    }

    // Meeting deletion/cancellation commands
    if (lowercaseInput.includes('cancel meeting') || lowercaseInput.includes('delete meeting') || lowercaseInput.includes('remove meeting')) {
      const meetingMatch = userInput.match(/(?:cancel|delete|remove)\s+meeting\s+(.+)$/i);
      
      if (meetingMatch) {
        const meetingName = meetingMatch[1]?.trim().toLowerCase();
        
        // Find matching meeting
        const matchingMeeting = realData.meetings?.find((meeting: any) => 
          meeting.title.toLowerCase().includes(meetingName) || meetingName.includes(meeting.title.toLowerCase())
        );
        
        if (matchingMeeting) {
          realData.updateMeeting.mutate({
            id: matchingMeeting.id,
            status: 'cancelled'
          });
          return `I've cancelled the meeting "${matchingMeeting.title}" scheduled for ${format(new Date(matchingMeeting.start_time), 'MMM d, h:mm a')}.`;
        } else {
          if (realData.meetings?.length > 0) {
            const meetingList = realData.meetings.slice(0, 3).map((meeting: any, index: number) => 
              `${index + 1}. ${meeting.title} (${format(new Date(meeting.start_time), 'MMM d, h:mm a')})`
            ).join(', ');
            return `I couldn't find a meeting matching "${meetingName}". Here are your upcoming meetings: ${meetingList}. Please be more specific.`;
          }
          return `I couldn't find a meeting matching "${meetingName}". You don't have any scheduled meetings.`;
        }
      }
      
      if (realData.meetings?.length > 0) {
        const meetingList = realData.meetings.slice(0, 3).map((meeting: any, index: number) => 
          `${index + 1}. ${meeting.title} (${format(new Date(meeting.start_time), 'MMM d, h:mm a')})`
        ).join(', ');
        return `Which meeting would you like to cancel? Here are your scheduled meetings: ${meetingList}`;
      }
      
      return "You don't have any scheduled meetings to cancel.";
    }

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
      return `I can help you with your tasks (${pendingTasks.length} pending), meetings (${todaysMeetings.length} today), messages (${unreadMessages.length} unread), and calls (${missedCalls.length} missed). I can also create/delete tasks and schedule/cancel meetings. Use "show," "list," or "create," "delete" commands. I remember our conversation context.`;
    }
    
    // Default response with real data context
    if (history.length > 0) {
      return `I heard you say: "${userInput}". I can help you manage your tasks, meetings, messages, and calls. We were previously talking about ${history[history.length - 1].userInput.toLowerCase().includes('meeting') ? 'meetings' : history[history.length - 1].userInput.toLowerCase().includes('task') ? 'tasks' : 'your requests'}.`;
    }
    
    return `I heard you say: "${userInput}". I can help you with your ${pendingTasks.length} pending tasks, ${todaysMeetings.length} meetings today, ${unreadMessages.length} unread messages, and ${missedCalls.length} missed calls. Try "create task," "schedule meeting," "show tasks," or "cancel meeting" commands.`;
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
            className="text-base mb-4"
            style={{ color: 'hsl(var(--app-text-secondary))' }}
          >
            {isListening 
              ? 'I\'m actively listening and can manage your tasks and meetings.'
              : 'Your AI assistant with full task and meeting management capabilities'
            }
          </p>

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
              "Create task buy groceries due tomorrow with high priority"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Schedule meeting team standup at 2pm tomorrow"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Complete task call dentist" or "Delete task old project"
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Cancel meeting weekly review" or "Show my tasks today"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
