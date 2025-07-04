
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
      <Card 
        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08)'
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <div 
              className="p-3 rounded-xl shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(167, 139, 250, 0.1))',
                border: '1px solid rgba(79, 70, 229, 0.2)'
              }}
            >
              <User className="w-6 h-6" style={{ color: 'hsl(var(--app-primary))' }} />
            </div>
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, hsl(var(--app-primary)), hsl(var(--app-secondary)))',
                boxShadow: '0 8px 25px rgba(79, 70, 229, 0.25)'
              }}
            >
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold" style={{ color: 'hsl(var(--app-text-primary))' }}>
                {user?.user_metadata?.full_name || 'User'}
              </h3>
              <p className="text-base font-medium" style={{ color: 'hsl(var(--app-text-secondary))' }}>
                {user?.email}
              </p>
              <p className="text-sm" style={{ color: 'hsl(var(--app-text-secondary))' }}>
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card 
        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08)'
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl" style={{ color: 'hsl(var(--app-text-primary))' }}>
            <div 
              className="p-3 rounded-xl shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <Settings className="w-6 h-6" style={{ color: 'hsl(var(--app-accent))' }} />
            </div>
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 group cursor-pointer"
              style={{ 
                backgroundColor: 'hsl(var(--app-background))',
                borderColor: 'rgba(79, 70, 229, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-105 transition-transform duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <Bell className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: 'hsl(var(--app-text-primary))' }}>
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
                className="shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                style={{
                  borderColor: 'rgba(79, 70, 229, 0.3)',
                  color: 'hsl(var(--app-primary))',
                  backgroundColor: 'rgba(79, 70, 229, 0.05)'
                }}
              >
                Configure
              </Button>
            </div>
            
            <div 
              className="flex items-center justify-between p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 group cursor-pointer"
              style={{ 
                backgroundColor: 'hsl(var(--app-background))',
                borderColor: 'rgba(79, 70, 229, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-105 transition-transform duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <CalendarIcon className="w-5 h-5" style={{ color: 'hsl(var(--app-accent))' }} />
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: 'hsl(var(--app-text-primary))' }}>
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
                className="shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                style={{
                  borderColor: 'rgba(79, 70, 229, 0.3)',
                  color: 'hsl(var(--app-primary))',
                  backgroundColor: 'rgba(79, 70, 229, 0.05)'
                }}
              >
                Setup
              </Button>
            </div>
            
            <div 
              className="flex items-center justify-between p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 group cursor-pointer"
              style={{ 
                backgroundColor: 'hsl(var(--app-background))',
                borderColor: 'rgba(79, 70, 229, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-xl group-hover:scale-105 transition-transform duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.05))',
                    border: '1px solid rgba(167, 139, 250, 0.2)'
                  }}
                >
                  <Shield className="w-5 h-5" style={{ color: 'hsl(var(--app-secondary))' }} />
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: 'hsl(var(--app-text-primary))' }}>
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
                className="shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                style={{
                  borderColor: 'rgba(79, 70, 229, 0.3)',
                  color: 'hsl(var(--app-primary))',
                  backgroundColor: 'rgba(79, 70, 229, 0.05)'
                }}
              >
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card 
        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
        style={{ 
          backgroundColor: 'hsl(var(--app-surface))',
          boxShadow: '0 8px 25px rgba(239, 68, 68, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08)'
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-xl" style={{ color: 'hsl(var(--app-text-primary))' }}>
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            className="w-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold py-3"
            style={{
              backgroundColor: '#EF4444',
              borderColor: '#EF4444',
              color: 'white',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
