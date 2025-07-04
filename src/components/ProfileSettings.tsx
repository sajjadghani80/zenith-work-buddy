
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings } from 'lucide-react';
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
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-300" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user?.user_metadata?.full_name || 'User'}</h3>
              <p className="text-gray-300">{user?.email}</p>
              <p className="text-sm text-gray-400">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-300" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-medium">Notifications</h4>
                <p className="text-sm text-gray-400">Manage your notification preferences</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-medium">Calendar Sync</h4>
                <p className="text-sm text-gray-400">Connect your external calendars</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white">
                Setup
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="font-medium">Privacy</h4>
                <p className="text-sm text-gray-400">Control your data and privacy settings</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full bg-red-500 hover:bg-red-600"
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
