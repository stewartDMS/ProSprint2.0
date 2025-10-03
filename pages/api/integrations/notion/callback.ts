import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../utils/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const userId = 'default'; // In production, get from session/auth
  
  const isConfigured = Boolean(
    process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    if (code && isConfigured) {
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64')}`,
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/notion/callback`,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Store token securely
          tokenStorage.store('notion', userId, {
            access_token: tokenData.access_token,
          });
          
          // Redirect to integrations page with success
          res.writeHead(302, { Location: '/integrations?connected=notion' });
          res.end();
          return;
        }
      } catch (error) {
        console.error('Notion OAuth error:', error);
      }
    }
    
    // Fallback for demo mode or error
    res.writeHead(302, { Location: '/integrations?error=notion' });
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
