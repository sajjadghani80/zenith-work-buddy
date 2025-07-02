
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckSquare, Clock, Plus, X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';

const TasksList = () => {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync({
      ...newTask,
      completed: false,
      due_date: newTask.due_date || undefined,
    });
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
    setShowAddForm(false);
  };

  const toggleComplete = (task: any) => {
    updateTask.mutate({ id: task.id, completed: !task.completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardContent className="p-6">
          <div className="text-center">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-300" />
            Tasks ({tasks.length})
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAddForm && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  rows={2}
                />
                <div className="flex gap-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <Input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">
                    Add Task
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-white/20 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => toggleComplete(task)}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                task.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              {task.completed && <CheckSquare className="w-3 h-3 text-white" />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-300 mb-2">{task.description}</p>
              )}
              
              {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  Due: {format(new Date(task.due_date), 'MMM dd, yyyy HH:mm')}
                </div>
              )}
            </div>
            
            <button
              onClick={() => deleteTask.mutate(task.id)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks yet. Click the + button to add your first task!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksList;
