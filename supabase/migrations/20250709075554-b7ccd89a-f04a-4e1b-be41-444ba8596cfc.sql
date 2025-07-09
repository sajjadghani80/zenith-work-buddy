-- Create table for meeting transcripts and summaries
CREATE TABLE public.meeting_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  summary TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  participants TEXT[],
  recording_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meeting_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own meeting transcripts" 
ON public.meeting_transcripts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting transcripts" 
ON public.meeting_transcripts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting transcripts" 
ON public.meeting_transcripts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting transcripts" 
ON public.meeting_transcripts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meeting_transcripts_updated_at
BEFORE UPDATE ON public.meeting_transcripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();