
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Call {
  id: string;
  contact_name: string;
  phone_number?: string;
  call_type: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  notes?: string;
  call_time: string;
  user_id: string;
}

export const useCalls = () => {
  const { user } = useAuth();

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('calls')
        .select('*')
        .order('call_time', { ascending: false });
      
      if (error) throw error;
      return data as Call[];
    },
    enabled: !!user,
  });

  return {
    calls,
    isLoading,
  };
};
