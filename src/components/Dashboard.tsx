
import React, { useState } from 'react';
import { Calendar, MessageSquare, Phone, CheckSquare, Mic, Bell, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceAssistant = () => {
    setIsListening(!isListening);
    // Voice recognition will be implemented later
    console.log('Voice assistant toggled:', !isListening);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Good Morning</h1>
            <p className="text-purple-200">Ready to optimize your day?</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleVoiceAssistant}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
          }`}
        >
          <Mic className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Daily Summary */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">5</div>
                <div className="text-sm text-purple-200">Meetings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">12</div>
                <div className="text-sm text-blue-200">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">3</div>
                <div className="text-sm text-green-200">Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">8</div>
                <div className="text-sm text-yellow-200">Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <h3 className="font-semibold">Schedule</h3>
              <p className="text-sm text-purple-200">Meetings</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <h3 className="font-semibold">Messages</h3>
              <p className="text-sm text-blue-200">Team Chat</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <h3 className="font-semibold">Calls</h3>
              <p className="text-sm text-green-200">Manage</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <CheckSquare className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <h3 className="font-semibold">Tasks</h3>
              <p className="text-sm text-yellow-200">To-Do</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              Upcoming Meetings
            </CardTitle>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-semibold">Team Standup</h4>
                <p className="text-sm text-purple-200">9:00 AM - 9:30 AM</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-semibold">Client Presentation</h4>
                <p className="text-sm text-purple-200">2:00 PM - 3:00 PM</p>
              </div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-semibold">Project Review</h4>
                <p className="text-sm text-purple-200">4:30 PM - 5:30 PM</p>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Tasks */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-300" />
              Priority Tasks
            </CardTitle>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <div className="flex-1">
                <h4 className="font-semibold">Prepare quarterly report</h4>
                <p className="text-sm text-blue-200">Due: Today 5:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <div className="flex-1">
                <h4 className="font-semibold">Review budget proposal</h4>
                <p className="text-sm text-blue-200">Due: Tomorrow 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <div className="flex-1">
                <h4 className="font-semibold">Schedule team building event</h4>
                <p className="text-sm text-blue-200">Due: This week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-300" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Meeting with Sarah completed</h4>
                <p className="text-sm text-green-200">Action items added to your tasks</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">New message from John</h4>
                <p className="text-sm text-blue-200">Project update ready for review</p>
                <p className="text-xs text-gray-400">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">Calendar sync completed</h4>
                <p className="text-sm text-yellow-200">All calendars updated successfully</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
