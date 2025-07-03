
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Message {
  id: string;
  sender_name: string;
  content: string;
  message_type: 'email' | 'chat' | 'sms';
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  received_at: string;
  user_id: string;
}

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('messages')
        .select('*')
        .order('received_at', { ascending: false });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await (supabase as any)
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return {
    messages,
    isLoading,
    markAsRead,
  };
};
