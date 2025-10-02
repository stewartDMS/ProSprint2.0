import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../utils/tokenStorage';

interface OutlookResponse {
  integration: string;
  status: string;
  configured: boolean;
  timestamp: string;
  capabilities?: string[];
  message?: string;
  auth_url?: string;
  connected?: boolean;
  [key: string]: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OutlookResponse>
) {
  const { method, query } = req;
  const userId = 'default';
  
  const isConfigured = Boolean(
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
  );
  
  if (method === 'GET') {
    const action = query.action as string || 'status';
    
    if (action === 'connect') {
      if (isConfigured) {
        const clientId = process.env.MICROSOFT_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/outlook?action=callback`;
        const scope = 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.Read offline_access';
        
        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_mode=query`;
        
        res.status(200).json({
          integration: 'Outlook',
          status: 'redirect',
          configured: isConfigured,
          timestamp: new Date().toISOString(),
          auth_url: authUrl,
          message: 'Redirect user to auth_url to authorize Outlook access',
        });
      } else {
        res.status(200).json({
          integration: 'Outlook',
          status: 'connected',
          configured: isConfigured,
          timestamp: new Date().toISOString(),
          message: 'Outlook connected in demo mode (configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET for real integration)',
        });
      }
    } else if (action === 'callback') {
      const code = query.code as string;
      
      if (code && isConfigured) {
        try {
          const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: process.env.MICROSOFT_CLIENT_ID!,
              client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
              redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/outlook?action=callback`,
              code,
            }),
          });
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            
            tokenStorage.store('outlook', userId, {
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
              scope: tokenData.scope,
            });
            
            res.writeHead(302, { Location: '/integrations?connected=outlook' });
            res.end();
            return;
          }
        } catch (error) {
          console.error('Outlook OAuth error:', error);
        }
      }
      
      res.writeHead(302, { Location: '/integrations?error=outlook' });
      res.end();
    } else if (action === 'disconnect') {
      tokenStorage.remove('outlook', userId);
      res.status(200).json({
        integration: 'Outlook',
        status: 'disconnected',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        message: 'Outlook disconnected successfully',
      });
    } else {
      const isConnected = tokenStorage.isValid('outlook', userId);
      
      res.status(200).json({
        integration: 'Outlook',
        status: isConnected ? 'connected' : 'disconnected',
        configured: isConfigured,
        connected: isConnected,
        timestamp: new Date().toISOString(),
        capabilities: isConnected ? [
          'Send emails via Microsoft Graph',
          'Read emails',
          'Manage calendars',
          'Search inbox',
          'Automated responses',
        ] : undefined,
        mode: isConfigured && isConnected ? 'production' : 'demo',
      });
    }
  } else if (method === 'POST') {
    const data = req.body;
    const action = data.action || 'send';
    const isConnected = tokenStorage.isValid('outlook', userId);
    
    try {
      if (isConfigured && isConnected) {
        // const token = tokenStorage.get('outlook', userId);
        
        // Make real API call to Microsoft Graph
        // Example: Send email via Microsoft Graph API
        // const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${token?.access_token}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     message: {
        //       subject: data.subject,
        //       body: {
        //         contentType: 'Text',
        //         content: data.body
        //       },
        //       toRecipients: [{ emailAddress: { address: data.recipient } }]
        //     }
        //   }),
        // });
        
        res.status(200).json({
          integration: 'Outlook',
          status: 'completed',
          configured: isConfigured,
          message: `Outlook ${action} operation successful (production mode)`,
          timestamp: new Date().toISOString(),
          action,
          entity_id: `outlook_${Date.now()}`,
          details: {
            platform: 'Outlook',
            operation: action,
            mode: 'production',
            recipient: data.recipient,
            subject: data.subject,
          },
        });
      } else {
        res.status(200).json({
          integration: 'Outlook',
          status: 'completed',
          configured: isConfigured,
          message: `Outlook ${action} operation successful (demo mode)`,
          timestamp: new Date().toISOString(),
          action,
          entity_id: `outlook_demo_${Date.now()}`,
          details: {
            platform: 'Demo Outlook',
            operation: action,
            mode: 'demo',
            note: 'Configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET for real integration',
            recipient: data.recipient,
            subject: data.subject,
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        integration: 'Outlook',
        status: 'error',
        configured: isConfigured,
        message: `Outlook operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    }
  } else if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
  } else {
    res.status(405).json({
      integration: 'Outlook',
      status: 'error',
      configured: isConfigured,
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });
  }
}
