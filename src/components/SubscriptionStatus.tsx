import React from 'react';
import { Crown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';

const SubscriptionStatus = () => {
  const { subscriptionData, checkSubscription } = useAuth();

  if (!subscriptionData) return null;

  const getStatusColor = (tier: string) => {
    switch (tier) {
      case 'Premium':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Pro':
        return 'bg-gradient-to-r from-purple-400 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-purple-700/30">
      <div className="flex items-center space-x-3">
        <Crown className="w-5 h-5 text-yellow-400" />
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">Subscription Status:</span>
            <Badge className={`${getStatusColor(subscriptionData.subscription_tier)} text-white border-0`}>
              {subscriptionData.subscription_tier}
            </Badge>
          </div>
          {subscriptionData.subscription_end && (
            <p className="text-sm text-purple-200">
              {subscriptionData.subscribed ? 'Renews' : 'Expires'} on{' '}
              {new Date(subscriptionData.subscription_end).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <Button
        onClick={checkSubscription}
        variant="outline"
        size="sm"
        className="border-purple-600 text-purple-300 hover:bg-purple-600/20"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default SubscriptionStatus;