import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const SubscriptionPlans = () => {
  const { subscriptionData } = useAuth();
  const { toast } = useToast();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Get started with basic features',
      features: [
        'Basic dashboard access',
        'Limited tasks (10 per month)',
        'Email support',
        'Basic calendar view'
      ],
      priceId: null,
      current: subscriptionData?.subscription_tier === 'Free'
    },
    {
      name: 'Pro',
      price: '$9.99',
      description: 'Perfect for professionals',
      features: [
        'Unlimited tasks',
        'Advanced calendar features',
        'Voice assistant access',
        'Priority email support',
        'Advanced analytics',
        'Export features'
      ],
      priceId: 'price_1OPriceId999', // Replace with your actual Stripe price ID
      current: subscriptionData?.subscription_tier === 'Pro',
      popular: true
    },
    {
      name: 'Premium',
      price: '$19.99',
      description: 'For teams and power users',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Advanced integrations',
        'Custom workflows',
        'Priority phone support',
        'Custom branding',
        'API access'
      ],
      priceId: 'price_1OPriceId1999', // Replace with your actual Stripe price ID
      current: subscriptionData?.subscription_tier === 'Premium'
    }
  ];

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: "Error", 
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-purple-200">Upgrade to unlock powerful features for your productivity</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-2 border-purple-400' : 'border-purple-700/30'} bg-slate-800/50`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                Most Popular
              </Badge>
            )}
            {plan.current && (
              <Badge className="absolute -top-2 right-4 bg-green-600 text-white">
                Current Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
              <CardDescription className="text-purple-200">{plan.description}</CardDescription>
              <div className="text-4xl font-bold text-white">
                {plan.price}
                {plan.name !== 'Free' && <span className="text-lg text-purple-200">/month</span>}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-purple-100">
                    <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {plan.current ? (
                subscriptionData?.subscription_tier !== 'Free' ? (
                  <Button 
                    onClick={handleManageSubscription}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button disabled className="w-full bg-gray-600">
                    Current Plan
                  </Button>
                )
              ) : (
                <Button 
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={!plan.priceId}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {plan.name === 'Free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {subscriptionData?.subscription_end && (
        <div className="text-center p-4 bg-purple-900/30 rounded-lg">
          <p className="text-purple-200">
            Your {subscriptionData.subscription_tier} subscription renews on{' '}
            {new Date(subscriptionData.subscription_end).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;