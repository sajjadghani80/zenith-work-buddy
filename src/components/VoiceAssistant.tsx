import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, MessageCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks } from '@/hooks/useTasks';
import { useMeetings } from '@/hooks/useMeetings';
import { useMessages } from '@/hooks/useMessages';
import { useCalls } from '@/hooks/useCalls';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import MeetingRecorder from '@/components/MeetingRecorder';
import { format, isToday, parse, addDays, addHours, isValid } from 'date-fns';

interface ConversationEntry {
  timestamp: Date;
  userInput: string;
  aiResponse: string;
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [activeTab, setActiveTab] = useState('assistant');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const recognitionRef = useRef<any>(null);
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Get real data from hooks
  const { tasks, createTask, deleteTask } = useTasks();
  const { meetings, createMeeting, updateMeeting } = useMeetings();
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
        if (isProcessingRef.current) return;
        
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
        
        if (finalTranscript.trim()) {
          isProcessingRef.current = true;
          console.log('Final transcript:', finalTranscript);
          setTranscript(finalTranscript);
          
          const aiResponse = await generateSmartResponse(finalTranscript, conversationHistory, {
            tasks,
            meetings,
            messages,
            calls,
            createTask,
            deleteTask,
            createMeeting,
            updateMeeting
          });
          
          setResponse(aiResponse);
          
          const newEntry: ConversationEntry = {
            timestamp: new Date(),
            userInput: finalTranscript,
            aiResponse: aiResponse
          };
          setConversationHistory(prev => [...prev.slice(-4), newEntry]);
          
          // Speak the response and then continue listening if in conversation mode
          try {
            await speak(aiResponse);
            
            // After speaking, restart listening if still in conversation mode
            if (isConversationMode) {
              setTimeout(() => {
                if (isConversationMode && !isSpeaking) {
                  console.log('Restarting listening after speech...');
                  startListening();
                }
                isProcessingRef.current = false;
              }, 1000);
            } else {
              isProcessingRef.current = false;
            }
          } catch (error) {
            console.error('Error speaking response:', error);
            isProcessingRef.current = false;
          }
          
        } else if (interimTranscript.trim()) {
          setTranscript(interimTranscript + ' (listening...)');
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        isProcessingRef.current = false;
        
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
          setIsConversationMode(false);
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, restarting...');
          if (isConversationMode && !isSpeaking && !isProcessingRef.current) {
            setTimeout(() => {
              startListening();
            }, 1500);
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
        
        // Only restart if we're in conversation mode and not currently processing
        if (isConversationMode && !isProcessingRef.current && !isSpeaking) {
          setTimeout(() => {
            if (isConversationMode) {
              console.log('Auto-restarting listening...');
              startListening();
            }
          }, 500);
        }
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

  const parseDateTime = (text: string): Date | null => {
    const now = new Date();
    const lowercaseText = text.toLowerCase();
    
    // Handle "today", "tomorrow", etc.
    if (lowercaseText.includes('today')) {
      return now;
    }
    if (lowercaseText.includes('tomorrow')) {
      return addDays(now, 1);
    }
    
    // Handle time patterns like "at 3pm", "at 15:30"
    const timeMatch = lowercaseText.match(/at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, assume tomorrow
      if (date < now) {
        return addDays(date, 1);
      }
      return date;
    }
    
    return null;
  };

  const extractTaskDetails = (text: string) => {
    const lowercaseText = text.toLowerCase();
    
    // Extract priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowercaseText.includes('high priority') || lowercaseText.includes('urgent')) {
      priority = 'high';
    } else if (lowercaseText.includes('low priority')) {
      priority = 'low';
    }
    
    // Extract due date
    const dueDate = parseDateTime(text);
    
    // Extract task title (remove command words and priority/time info)
    let title = text
      .replace(/add task|create task|new task/gi, '')
      .replace(/high priority|low priority|medium priority|urgent/gi, '')
      .replace(/today|tomorrow|at \d{1,2}(?::\d{2})?\s*(am|pm)?/gi, '')
      .trim();
    
    return { title, priority, dueDate };
  };

  const extractMeetingDetails = (text: string) => {
    const lowercaseText = text.toLowerCase();
    
    // Extract meeting title
    let title = text
      .replace(/add meeting|create meeting|new meeting|schedule meeting/gi, '')
      .replace(/today|tomorrow|at \d{1,2}(?::\d{2})?\s*(am|pm)?/gi, '')
      .trim();
    
    // Extract start time
    const startTime = parseDateTime(text) || addHours(new Date(), 1);
    
    // Default to 1 hour duration
    const endTime = addHours(startTime, 1);
    
    return { title, startTime, endTime };
  };

  const generateSmartResponse = async (userInput: string, history: ConversationEntry[], realData: any) => {
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
    if (lowercaseInput.includes('add task') || lowercaseInput.includes('create task') || lowercaseInput.includes('new task')) {
      try {
        const { title, priority, dueDate } = extractTaskDetails(userInput);
        
        if (!title) {
          return 'I need a task title. Please say something like "Add task call the dentist" or "Create high priority task finish report today".';
        }
        
        await realData.createTask.mutateAsync({
          title,
          priority,
          due_date: dueDate?.toISOString(),
          completed: false,
          description: ''
        });
        
        let response = `I've added the task "${title}" with ${priority} priority`;
        if (dueDate) {
          response += ` due ${isToday(dueDate) ? 'today' : format(dueDate, 'MMM d')}`;
        }
        return response + '.';
      } catch (error) {
        console.error('Error creating task:', error);
        return 'Sorry, I had trouble creating that task. Please try again.';
      }
    }

    // Task removal commands
    if (lowercaseInput.includes('remove task') || lowercaseInput.includes('delete task') || lowercaseInput.includes('complete task')) {
      const taskKeywords = userInput.toLowerCase()
        .replace(/remove task|delete task|complete task/gi, '')
        .trim();
      
      if (!taskKeywords) {
        if (pendingTasks.length > 0) {
          const taskList = pendingTasks.slice(0, 3).map((task: any, index: number) => 
            `${index + 1}. ${task.title}`
          ).join(', ');
          return `Which task would you like to remove? Here are your recent tasks: ${taskList}`;
        }
        return 'You don\'t have any pending tasks to remove.';
      }
      
      // Find matching task
      const matchingTask = pendingTasks.find((task: any) => 
        task.title.toLowerCase().includes(taskKeywords)
      );
      
      if (matchingTask) {
        try {
          await realData.deleteTask.mutateAsync(matchingTask.id);
          return `I've removed the task "${matchingTask.title}".`;
        } catch (error) {
          console.error('Error deleting task:', error);
          return 'Sorry, I had trouble removing that task. Please try again.';
        }
      } else {
        return `I couldn't find a task matching "${taskKeywords}". Please be more specific.`;
      }
    }

    // Meeting creation commands
    if (lowercaseInput.includes('add meeting') || lowercaseInput.includes('create meeting') || 
        lowercaseInput.includes('new meeting') || lowercaseInput.includes('schedule meeting')) {
      try {
        const { title, startTime, endTime } = extractMeetingDetails(userInput);
        
        if (!title) {
          return 'I need a meeting title. Please say something like "Add meeting team standup today at 9am" or "Schedule meeting with client tomorrow at 2pm".';
        }
        
        await realData.createMeeting.mutateAsync({
          title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'scheduled',
          attendees: [],
          description: '',
          location: ''
        });
        
        return `I've scheduled "${title}" for ${format(startTime, 'MMM d')} at ${format(startTime, 'h:mm a')}.`;
      } catch (error) {
        console.error('Error creating meeting:', error);
        return 'Sorry, I had trouble scheduling that meeting. Please try again.';
      }
    }

    // Meeting removal commands
    if (lowercaseInput.includes('remove meeting') || lowercaseInput.includes('delete meeting') || 
        lowercaseInput.includes('cancel meeting')) {
      const meetingKeywords = userInput.toLowerCase()
        .replace(/remove meeting|delete meeting|cancel meeting/gi, '')
        .trim();
      
      if (!meetingKeywords) {
        if (todaysMeetings.length > 0) {
          const meetingList = todaysMeetings.map((meeting: any, index: number) => 
            `${index + 1}. ${meeting.title} at ${format(new Date(meeting.start_time), 'h:mm a')}`
          ).join(', ');
          return `Which meeting would you like to cancel? Here are today's meetings: ${meetingList}`;
        }
        return 'You don\'t have any upcoming meetings to cancel.';
      }
      
      // Find matching meeting
      const upcomingMeetings = realData.meetings?.filter((meeting: any) => 
        new Date(meeting.start_time) > new Date()
      ) || [];
      
      const matchingMeeting = upcomingMeetings.find((meeting: any) => 
        meeting.title.toLowerCase().includes(meetingKeywords)
      );
      
      if (matchingMeeting) {
        try {
          await realData.updateMeeting.mutateAsync({
            id: matchingMeeting.id,
            status: 'cancelled'
          });
          return `I've cancelled the meeting "${matchingMeeting.title}".`;
        } catch (error) {
          console.error('Error cancelling meeting:', error);
          return 'Sorry, I had trouble cancelling that meeting. Please try again.';
        }
      } else {
        return `I couldn't find a meeting matching "${meetingKeywords}". Please be more specific.`;
      }
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
      return `I can help you with your tasks (${pendingTasks.length} pending), meetings (${todaysMeetings.length} today), messages (${unreadMessages.length} unread), and calls (${missedCalls.length} missed). I can also add, remove, and manage your tasks and meetings. Try saying "add task" or "schedule meeting".`;
    }
    
    // Default response with real data context
    if (history.length > 0) {
      return `I heard you say: "${userInput}". I can help you with your tasks, meetings, messages, and calls. We were previously talking about ${history[history.length - 1].userInput.toLowerCase().includes('meeting') ? 'meetings' : history[history.length - 1].userInput.toLowerCase().includes('task') ? 'tasks' : 'your requests'}.`;
    }
    
    return `I heard you say: "${userInput}". I can help you with your ${pendingTasks.length} pending tasks, ${todaysMeetings.length} meetings today, ${unreadMessages.length} unread messages, and ${missedCalls.length} missed calls. I can also add, remove, and manage your tasks and meetings.`;
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening || isProcessingRef.current) {
      console.log('Cannot start listening:', { isListening, isProcessing: isProcessingRef.current });
      return;
    }

    try {
      setTranscript('');
      setError('');
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start listening. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('Stopping speech recognition...');
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
      console.log('Stopping conversation mode...');
      setIsConversationMode(false);
      stopListening();
      isProcessingRef.current = false;
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
      }
    } else {
      // Start conversation mode
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Starting conversation mode...');
        setIsConversationMode(true);
        setError('');
        isProcessingRef.current = false;
        setTimeout(() => {
          startListening();
        }, 500);
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="meeting" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Meeting Recorder
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant" className="mt-6">
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
              "Add task call the dentist tomorrow" (Creates new tasks with dates)
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Schedule meeting with team today at 2pm" (Creates new meetings)
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "Remove task dentist" or "Cancel meeting with team" (Removes items)
            </p>
            <p 
              className="flex items-center gap-2"
              style={{ color: 'hsl(var(--app-text-secondary))' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-primary))' }}
              />
              "What are my tasks for today?" (Shows your real data)
            </p>
           </div>
        </CardContent>
      </Card>
    </TabsContent>
        
        <TabsContent value="meeting" className="mt-6">
          <MeetingRecorder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceAssistant;
