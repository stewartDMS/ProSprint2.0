import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../utils/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const userId = 'default'; // In production, get from session/auth
  
  const isConfigured = Boolean(
    process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    if (code && isConfigured) {
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.GMAIL_CLIENT_ID!,
            client_secret: process.env.GMAIL_CLIENT_SECRET!,
            redirect_uri: process.env.GMAIL_REDIRECT_URI || 'https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback',
            code,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Store token securely
          tokenStorage.store('gmail', userId, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          });
          
          // Redirect to integrations page with success
          res.writeHead(302, { Location: '/integrations?connected=gmail' });
          res.end();
          return;
        }
      } catch (error) {
        console.error('Gmail OAuth error:', error);
      }
    }
    
    // Fallback for demo mode or error
    res.writeHead(302, { Location: '/integrations?error=gmail' });
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
