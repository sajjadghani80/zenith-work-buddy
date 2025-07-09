import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import SubscriptionStatus from '@/components/SubscriptionStatus';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showSubscription?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showSubscription = false 
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24" style={{ backgroundColor: 'hsl(var(--app-background))' }}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'hsl(var(--app-text-primary))' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg" style={{ color: 'hsl(var(--app-text-secondary))' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Subscription Status */}
      {showSubscription && <div className="mb-6"><SubscriptionStatus /></div>}

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;