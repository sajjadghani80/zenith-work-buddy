import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'post_call':
        systemPrompt = 'You are a helpful AI assistant that provides brief, contextual responses after phone calls end. Be concise and actionable.';
        userPrompt = `A phone call just ended that lasted ${context.duration} seconds. Generate a brief message about what the user might want to do next (like taking notes, scheduling follow-up, or sending a message).`;
        break;

      case 'missed_call':
        systemPrompt = 'You are an AI assistant that generates professional auto-responses for missed calls. Be polite and helpful.';
        userPrompt = 'Generate a brief, professional message to send when someone misses a call, explaining they will get back to them soon.';
        break;

      case 'busy_response':
        systemPrompt = 'You are an AI assistant that generates polite auto-responses when someone is busy. Be brief and professional.';
        userPrompt = `Generate a brief message explaining that the person is currently ${context?.activity || 'busy'} and will respond when available.`;
        break;

      case 'sms_response':
        systemPrompt = 'You are an AI assistant that generates intelligent auto-responses to SMS messages. Be helpful, brief, and context-aware. Only suggest a response, do not actually send it.';
        userPrompt = `Someone sent this SMS: "${context.content}" from ${context.sender}. Generate an appropriate auto-response that acknowledges the message and indicates when they might hear back.`;
        break;

      default:
        throw new Error('Invalid response type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    const result = {
      type,
      message: type === 'post_call' ? aiResponse : undefined,
      response: type === 'sms_response' ? aiResponse : undefined,
      autoResponse: ['missed_call', 'busy_response'].includes(type) ? aiResponse : undefined,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-assistant-response function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});