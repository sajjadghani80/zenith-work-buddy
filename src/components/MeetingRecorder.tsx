import React, { useState } from 'react';
import { Mic, MicOff, FileText, CheckSquare, Users, Clock, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMeetingRecorder } from '@/hooks/useMeetingRecorder';
import { useMeetings } from '@/hooks/useMeetings';
import { useTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';

const MeetingRecorder = () => {
  const {
    isRecording,
    isProcessing,
    transcript,
    processedMeeting,
    error,
    startRecording,
    stopRecording,
    saveMeetingData,
    clearRecording
  } = useMeetingRecorder();

  const { meetings } = useMeetings();
  const { createTask } = useTasks();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);

  const handleStartRecording = async () => {
    setRecordingStartTime(new Date());
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
    setRecordingStartTime(null);
  };

  const handleSaveRecording = async () => {
    await saveMeetingData(selectedMeetingId || undefined);
  };

  const handleCreateTasksFromActionItems = async () => {
    if (!processedMeeting?.actionItems?.length) return;

    try {
      for (const item of processedMeeting.actionItems) {
        const dueDate = item.dueDate ? new Date(item.dueDate) : undefined;
        
        await createTask.mutateAsync({
          title: item.task,
          description: `Assigned to: ${item.assignee || 'Unassigned'}\nFrom meeting discussion`,
          priority: item.priority,
          due_date: dueDate?.toISOString(),
          completed: false
        });
      }
    } catch (error) {
      console.error('Error creating tasks:', error);
    }
  };

  const getRecordingDuration = () => {
    if (!recordingStartTime) return '00:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - recordingStartTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const todaysMeetings = meetings?.filter(meeting => 
    format(new Date(meeting.start_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || [];

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card 
        className="shadow-lg border-0" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <Mic className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            Meeting Recorder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            {!isRecording && !isProcessing ? (
              <Button
                onClick={handleStartRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : isRecording ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleStopRecording}
                  size="lg"
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
                <div className="flex items-center gap-2" style={{ color: 'hsl(var(--app-text-primary))' }}>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-lg">{getRecordingDuration()}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2" style={{ color: 'hsl(var(--app-text-primary))' }}>
                <Clock className="w-5 h-5 animate-spin" />
                <span>Processing recording...</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {transcript && (
        <Card 
          className="shadow-lg border-0" 
          style={{ 
            backgroundColor: 'hsl(var(--app-surface))',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
              <FileText className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
              Meeting Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 w-full rounded border p-4">
              <p style={{ color: 'hsl(var(--app-text-primary))' }} className="text-sm leading-relaxed">
                {transcript}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Meeting Summary and Action Items */}
      {processedMeeting && (
        <div className="space-y-4">
          {/* Summary */}
          <Card 
            className="shadow-lg border-0" 
            style={{ 
              backgroundColor: 'hsl(var(--app-surface))',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
                <FileText className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
                Meeting Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'hsl(var(--app-text-primary))' }} className="leading-relaxed">
                {processedMeeting.summary}
              </p>
            </CardContent>
          </Card>

          {/* Participants */}
          {processedMeeting.participants.length > 0 && (
            <Card 
              className="shadow-lg border-0" 
              style={{ 
                backgroundColor: 'hsl(var(--app-surface))',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
                  <Users className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {processedMeeting.participants.map((participant, index) => (
                    <Badge key={index} variant="secondary">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {processedMeeting.actionItems.length > 0 && (
            <Card 
              className="shadow-lg border-0" 
              style={{ 
                backgroundColor: 'hsl(var(--app-surface))',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
                    <CheckSquare className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
                    Action Items ({processedMeeting.actionItems.length})
                  </CardTitle>
                  <Button
                    onClick={handleCreateTasksFromActionItems}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Create Tasks
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processedMeeting.actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border"
                      style={{ backgroundColor: 'hsl(var(--app-background))', borderColor: 'hsl(var(--app-border))' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p style={{ color: 'hsl(var(--app-text-primary))' }} className="font-medium">
                            {item.task}
                          </p>
                          {item.assignee && (
                            <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm mt-1">
                              Assigned to: {item.assignee}
                            </p>
                          )}
                          {item.dueDate && (
                            <p style={{ color: 'hsl(var(--app-text-secondary))' }} className="text-sm mt-1">
                              Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={item.priority === 'high' ? 'destructive' : 
                                  item.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Options */}
          <Card 
            className="shadow-lg border-0" 
            style={{ 
              backgroundColor: 'hsl(var(--app-surface))',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Select value={selectedMeetingId} onValueChange={setSelectedMeetingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to existing meeting (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {todaysMeetings.map((meeting) => (
                        <SelectItem key={meeting.id} value={meeting.id}>
                          {meeting.title} - {format(new Date(meeting.start_time), 'h:mm a')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveRecording} style={{ backgroundColor: 'hsl(var(--app-primary))' }}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Recording
                </Button>
                <Button onClick={clearRecording} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MeetingRecorder;