import type { NextApiRequest, NextApiResponse } from 'next';

// Startup logging for OpenAI API configuration
console.log('[OpenAI] ========================================');
console.log('[OpenAI] OpenAI API Configuration Check');
console.log('[OpenAI] ========================================');
const openaiKeyPresent = !!process.env.OPENAI_API_KEY;
console.log(`[OpenAI] OPENAI_API_KEY present: ${openaiKeyPresent}`);
if (openaiKeyPresent) {
  const keyLength = process.env.OPENAI_API_KEY?.length || 0;
  console.log(`[OpenAI] Key length: ${keyLength} characters`);
  console.log('[OpenAI] ✓ OpenAI API key configured - AI features enabled');
} else {
  console.log('[OpenAI] ⚠ No OpenAI API key - running in DEMO mode');
  console.log('[OpenAI] Set OPENAI_API_KEY environment variable to enable AI features');
}
console.log('[OpenAI] ========================================');

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIRequest {
  messages: OpenAIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface ErrorResponse {
  error: string;
  demoMode: boolean;
}

type ApiResponse = OpenAIResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', demoMode: false });
    return;
  }

  // Check if API key is configured (server-side only)
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    // Return error indicating demo mode
    res.status(200).json({ 
      error: 'OpenAI API key not configured. Running in demo mode.',
      demoMode: true 
    });
    return;
  }

  try {
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 500 } = req.body as OpenAIRequest;

    // Validate request body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Invalid request: messages array is required', demoMode: false });
      return;
    }

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API error:', errorData);
      res.status(response.status).json({ 
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
        demoMode: false 
      });
      return;
    }

    const data = await response.json() as OpenAIResponse;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error processing OpenAI request:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      demoMode: false 
    });
  }
}
