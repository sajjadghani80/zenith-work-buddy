
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
      <Card className="shadow-sm" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
            >
              <User className="w-5 h-5" style={{ color: 'hsl(var(--app-primary))' }} />
            </div>
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, hsl(var(--app-primary)), hsl(var(--app-secondary)))' 
              }}
            >
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: 'hsl(var(--app-text-primary))' }}>
                {user?.user_metadata?.full_name || 'User'}
              </h3>
              <p style={{ color: 'hsl(var(--app-text-secondary))' }}>{user?.email}</p>
              <p className="text-sm" style={{ color: 'hsl(var(--app-text-secondary))' }}>
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="shadow-sm" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <Settings className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
            </div>
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: 'rgba(110, 110, 115, 0.05)',
                borderColor: 'rgba(110, 110, 115, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Bell className="w-4 h-4" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'hsl(var(--app-text-primary))' }}>
                    Notifications
                  </h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--app-text-secondary))' }}>
                    Manage your notification preferences
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: 'rgba(110, 110, 115, 0.2)',
                  color: 'hsl(var(--app-text-secondary))'
                }}
              >
                Configure
              </Button>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: 'rgba(110, 110, 115, 0.05)',
                borderColor: 'rgba(110, 110, 115, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <CalendarIcon className="w-4 h-4" style={{ color: 'hsl(var(--app-accent))' }} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'hsl(var(--app-text-primary))' }}>
                    Calendar Sync
                  </h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--app-text-secondary))' }}>
                    Connect your external calendars
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: 'rgba(110, 110, 115, 0.2)',
                  color: 'hsl(var(--app-text-secondary))'
                }}
              >
                Setup
              </Button>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-all duration-200"
              style={{ 
                backgroundColor: 'rgba(110, 110, 115, 0.05)',
                borderColor: 'rgba(110, 110, 115, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}
                >
                  <Shield className="w-4 h-4" style={{ color: 'hsl(var(--app-secondary))' }} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'hsl(var(--app-text-primary))' }}>
                    Privacy
                  </h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--app-text-secondary))' }}>
                    Control your data and privacy settings
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: 'rgba(110, 110, 115, 0.2)',
                  color: 'hsl(var(--app-text-secondary))'
                }}
              >
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="shadow-sm" style={{ backgroundColor: 'hsl(var(--app-surface))' }}>
        <CardHeader className="pb-4">
          <CardTitle style={{ color: 'hsl(var(--app-text-primary))' }}>Account Actions</CardTitle>
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
