import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../utils/tokenStorage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const userId = 'default'; // In production, get from session/auth
  
  const isConfigured = Boolean(
    process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    if (code && isConfigured) {
      try {
        // Use login.salesforce.com for production or test.salesforce.com for sandbox
        const baseUrl = process.env.SALESFORCE_SANDBOX === 'true' ? 'https://test.salesforce.com' : 'https://login.salesforce.com';
        
        // Exchange code for access token
        const tokenResponse = await fetch(`${baseUrl}/services/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.SALESFORCE_CLIENT_ID!,
            client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pro-sprint-ai.vercel.app'}/api/integrations/salesforce/callback`,
            code,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // Store token securely
          tokenStorage.store('salesforce', userId, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_type: tokenData.token_type,
          });
          
          // Redirect to integrations page with success
          res.writeHead(302, { Location: '/integrations?connected=salesforce' });
          res.end();
          return;
        }
      } catch (error) {
        console.error('Salesforce OAuth error:', error);
      }
    }
    
    // Fallback for demo mode or error
    res.writeHead(302, { Location: '/integrations?error=salesforce' });
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
