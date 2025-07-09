import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript, meetingId } = await req.json()
    
    if (!transcript) {
      throw new Error('Transcript is required')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Processing meeting transcript for summary and action items...')

    // Create prompts for AI processing
    const summaryPrompt = `
Please analyze this meeting transcript and provide:
1. A concise summary of the main discussion points
2. Extract any action items or tasks that need to be completed
3. Identify participants if mentioned

Transcript:
${transcript}

Please respond in JSON format with the following structure:
{
  "summary": "Brief summary of the meeting",
  "actionItems": [
    {
      "task": "Task description",
      "assignee": "Person assigned (if mentioned)",
      "dueDate": "Due date if mentioned (ISO format)",
      "priority": "high|medium|low"
    }
  ],
  "participants": ["List of participants mentioned"]
}
`

    // Call OpenAI for processing
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes meeting transcripts to extract summaries and action items. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    let processedData;
    try {
      processedData = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      // Fallback response
      processedData = {
        summary: "Meeting summary could not be generated due to parsing error.",
        actionItems: [],
        participants: []
      }
    }

    console.log('Successfully processed meeting transcript')

    // If meetingId is provided, save to database
    if (meetingId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Get user ID from request headers
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        
        if (user) {
          const { error } = await supabase
            .from('meeting_transcripts')
            .insert({
              user_id: user.id,
              meeting_id: meetingId,
              transcript: transcript,
              summary: processedData.summary,
              action_items: processedData.actionItems,
              participants: processedData.participants
            })
          
          if (error) {
            console.error('Error saving transcript:', error)
          } else {
            console.log('Transcript saved successfully')
          }
        }
      }
    }

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-meeting function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})