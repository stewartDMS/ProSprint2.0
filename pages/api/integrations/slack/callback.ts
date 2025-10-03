import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../utils/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const userId = 'default'; // In production, get from session/auth
  
  const isConfigured = Boolean(
    process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    if (code && isConfigured) {
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pro-sprint-ai.vercel.app'}/api/integrations/slack/callback`,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          if (tokenData.ok) {
            // Store token securely
            tokenStorage.store('slack', userId, {
              access_token: tokenData.access_token,
              token_type: tokenData.token_type,
              scope: tokenData.scope,
            });
            
            // Redirect to integrations page with success
            res.writeHead(302, { Location: '/integrations?connected=slack' });
            res.end();
            return;
          }
        }
      } catch (error) {
        console.error('Slack OAuth error:', error);
      }
    }
    
    // Fallback for demo mode or error
    res.writeHead(302, { Location: '/integrations?error=slack' });
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
