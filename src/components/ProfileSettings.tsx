
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, Bell, Calendar as CalendarIcon, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const ProfileSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SubscriptionStatus />
      
      {/* Subscription Plans */}
      <SubscriptionPlans />
      
      {/* User Profile */}
      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{user?.user_metadata?.full_name || 'User'}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Notifications</h4>
                  <p className="text-sm text-gray-600">Manage your notification preferences</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Calendar Sync</h4>
                  <p className="text-sm text-gray-600">Connect your external calendars</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                Setup
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Privacy</h4>
                  <p className="text-sm text-gray-600">Control your data and privacy settings</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-800">Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
