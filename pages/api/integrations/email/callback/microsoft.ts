import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../../utils/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const userId = 'default'; // In production, get from session/auth
  
  const isConfigured = Boolean(
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    if (code && isConfigured) {
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
            redirect_uri: process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pro-sprint-ai.vercel.app'}/api/integrations/email/callback/microsoft`,
            code,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Store token securely
          tokenStorage.store('outlook', userId, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          });
          
          // Redirect to integrations page with success
          res.writeHead(302, { Location: '/integrations?connected=outlook' });
          res.end();
          return;
        }
      } catch (error) {
        console.error('Outlook OAuth error:', error);
      }
    }
    
    // Fallback for demo mode or error
    res.writeHead(302, { Location: '/integrations?error=outlook' });
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
