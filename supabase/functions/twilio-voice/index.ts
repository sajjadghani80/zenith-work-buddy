
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'webhook') {
      // Handle incoming call webhook from Twilio
      const formData = await req.formData();
      const from = formData.get('From');
      const to = formData.get('To');
      const callSid = formData.get('CallSid');
      
      console.log('Incoming call from:', from, 'to:', to);
      
      // TwiML response for AI auto-answer
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Hello! You've reached an AI assistant. I'm currently taking a message. Please speak after the beep, and I'll make sure your message is delivered.</Say>
          <Record maxLength="60" transcribe="true" transcribeCallback="/functions/v1/twilio-voice/transcribe" />
          <Say voice="alice">Thank you for your message. Goodbye!</Say>
        </Response>`;

      return new Response(twiml, {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      });
    }

    if (action === 'transcribe') {
      // Handle transcription webhook
      const formData = await req.formData();
      const transcriptionText = formData.get('TranscriptionText');
      const from = formData.get('From');
      const callSid = formData.get('CallSid');
      
      console.log('Transcription received:', transcriptionText);
      
      // Here you would save to your database
      // For now, just log the transcription
      
      return new Response('OK', { headers: corsHeaders });
    }

    if (action === 'make-call') {
      // Make outgoing call
      const { to, message } = await req.json();
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber!,
          To: to,
          Url: `${req.headers.get('origin')}/functions/v1/twilio-voice/outbound-twiml?message=${encodeURIComponent(message)}`,
        }),
      });

      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'outbound-twiml') {
      // TwiML for outbound calls
      const message = url.searchParams.get('message') || 'Hello, this is an automated message.';
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">${message}</Say>
        </Response>`;

      return new Response(twiml, {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
    
  } catch (error) {
    console.error('Error in twilio-voice function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
