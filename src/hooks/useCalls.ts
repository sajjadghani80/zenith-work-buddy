
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('call_time', { ascending: false });
      
      if (error) throw error;
      return data as Call[];
    },
    enabled: !!user,
  });

  const addCall = useMutation({
    mutationFn: async (newCall: Omit<Call, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('calls')
        .insert([{ ...newCall, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });

  const updateCall = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Call> }) => {
      const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    },
  });

  return {
    calls,
    isLoading,
    addCall: addCall.mutate,
    updateCall: updateCall.mutate,
    isAddingCall: addCall.isPending,
    isUpdatingCall: updateCall.isPending,
  };
};
