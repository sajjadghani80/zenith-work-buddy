
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('email', 'chat', 'sms')) DEFAULT 'email',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create calls table
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  call_type TEXT CHECK (call_type IN ('incoming', 'outgoing', 'missed')) NOT NULL,
  duration INTEGER, -- in seconds
  notes TEXT,
  call_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create voice_notes table
CREATE TABLE public.voice_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  transcript TEXT,
  audio_url TEXT,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meetings
CREATE POLICY "Users can view own meetings" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for calls
CREATE POLICY "Users can view own calls" ON public.calls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own calls" ON public.calls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calls" ON public.calls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calls" ON public.calls FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for voice_notes
CREATE POLICY "Users can view own voice notes" ON public.voice_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own voice notes" ON public.voice_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voice notes" ON public.voice_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own voice notes" ON public.voice_notes FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data for demonstration
INSERT INTO public.tasks (user_id, title, description, priority, due_date) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Prepare quarterly report', 'Complete Q4 financial analysis and presentation', 'high', NOW() + INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000000', 'Review budget proposal', 'Analyze departmental budget requests for next year', 'medium', NOW() + INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000000', 'Schedule team building event', 'Coordinate with HR for upcoming team activities', 'low', NOW() + INTERVAL '1 week');

INSERT INTO public.meetings (user_id, title, description, start_time, end_time, location, attendees) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Team Standup', 'Daily team sync meeting', NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '1 hour', 'Conference Room A', '["John", "Sarah", "Mike"]'),
  ('00000000-0000-0000-0000-000000000000', 'Client Presentation', 'Present Q4 results to stakeholders', NOW() + INTERVAL '5 hours', NOW() + INTERVAL '6 hours', 'Virtual Meeting', '["Client Team", "Product Manager"]'),
  ('00000000-0000-0000-0000-000000000000', 'Project Review', 'Review current project status and next steps', NOW() + INTERVAL '7.5 hours', NOW() + INTERVAL '8.5 hours', 'Conference Room B', '["Development Team"]');

INSERT INTO public.messages (user_id, sender_name, content, message_type, priority) VALUES
  ('00000000-0000-0000-0000-000000000000', 'John Smith', 'Project update ready for review. Please check the latest changes in the development branch.', 'email', 'medium'),
  ('00000000-0000-0000-0000-000000000000', 'Sarah Wilson', 'Meeting agenda for tomorrow''s client call attached. Please review before the meeting.', 'email', 'high'),
  ('00000000-0000-0000-0000-000000000000', 'Mike Johnson', 'Budget approval needed for the new marketing campaign. Deadline is end of week.', 'chat', 'high');

INSERT INTO public.calls (user_id, contact_name, phone_number, call_type, duration, notes) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Alice Brown', '+1-555-0123', 'missed', NULL, 'Missed call - probably about the contract review'),
  ('00000000-0000-0000-0000-000000000000', 'Bob Davis', '+1-555-0456', 'outgoing', 180, 'Discussed project timeline and deliverables'),
  ('00000000-0000-0000-0000-000000000000', 'Carol White', '+1-555-0789', 'incoming', 420, 'Client feedback on recent deliverables - very positive');
