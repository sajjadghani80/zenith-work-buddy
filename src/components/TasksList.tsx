
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
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border-gray-100">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-gray-100 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-purple-600" />
            </div>
            Your Tasks ({tasks.filter(t => !t.completed).length})
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 p-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="bg-white border-gray-200"
                  required
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="bg-white border-gray-200"
                  rows={2}
                />
                <div className="flex gap-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-700"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <Input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Add Task
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
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
            className={`flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => toggleComplete(task)}
              className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              {task.completed && <CheckSquare className="w-4 h-4" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold text-gray-800 ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              )}
              
              {task.due_date && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
            
            <button
              onClick={() => deleteTask.mutate(task.id)}
              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-gray-400">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No tasks yet</p>
            <p className="text-sm">Click the + button to add your first task!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksList;
