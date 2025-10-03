import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../utils/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const userId = 'default'; // In production, get from session/auth
  
  const isConfigured = Boolean(
    process.env.JIRA_CLIENT_ID && process.env.JIRA_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    if (code && isConfigured) {
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.JIRA_CLIENT_ID!,
            client_secret: process.env.JIRA_CLIENT_SECRET!,
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/jira/callback`,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Store token securely
          tokenStorage.store('jira', userId, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          });
          
          // Redirect to integrations page with success
          res.writeHead(302, { Location: '/integrations?connected=jira' });
          res.end();
          return;
        }
      } catch (error) {
        console.error('Jira OAuth error:', error);
      }
    }
    
    // Fallback for demo mode or error
    res.writeHead(302, { Location: '/integrations?error=jira' });
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
