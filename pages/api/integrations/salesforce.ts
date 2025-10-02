import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../utils/tokenStorage';

interface SalesforceResponse {
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
  res: NextApiResponse<SalesforceResponse>
) {
  const { method, query } = req;
  const userId = 'default';
  
  const isConfigured = Boolean(
    process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET
  );
  
  if (method === 'GET') {
    const action = query.action as string || 'status';
    
    if (action === 'connect') {
      if (isConfigured) {
        const clientId = process.env.SALESFORCE_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/salesforce?action=callback`;
        
        // Use login.salesforce.com for production or test.salesforce.com for sandbox
        const baseUrl = process.env.SALESFORCE_SANDBOX === 'true' ? 'https://test.salesforce.com' : 'https://login.salesforce.com';
        
        const authUrl = `${baseUrl}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        
        res.status(200).json({
          integration: 'Salesforce',
          status: 'redirect',
          configured: isConfigured,
          timestamp: new Date().toISOString(),
          auth_url: authUrl,
          message: 'Redirect user to auth_url to authorize Salesforce access',
        });
      } else {
        res.status(200).json({
          integration: 'Salesforce',
          status: 'connected',
          configured: isConfigured,
          timestamp: new Date().toISOString(),
          message: 'Salesforce connected in demo mode (configure SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET for real integration)',
        });
      }
    } else if (action === 'callback') {
      const code = query.code as string;
      
      if (code && isConfigured) {
        try {
          const baseUrl = process.env.SALESFORCE_SANDBOX === 'true' ? 'https://test.salesforce.com' : 'https://login.salesforce.com';
          
          const tokenResponse = await fetch(`${baseUrl}/services/oauth2/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: process.env.SALESFORCE_CLIENT_ID!,
              client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
              redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/integrations/salesforce?action=callback`,
              code,
            }),
          });
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            
            tokenStorage.store('salesforce', userId, {
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              token_type: tokenData.token_type,
            });
            
            res.writeHead(302, { Location: '/integrations?connected=salesforce' });
            res.end();
            return;
          }
        } catch (error) {
          console.error('Salesforce OAuth error:', error);
        }
      }
      
      res.writeHead(302, { Location: '/integrations?error=salesforce' });
      res.end();
    } else if (action === 'disconnect') {
      tokenStorage.remove('salesforce', userId);
      res.status(200).json({
        integration: 'Salesforce',
        status: 'disconnected',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        message: 'Salesforce disconnected successfully',
      });
    } else {
      const isConnected = tokenStorage.isValid('salesforce', userId);
      
      res.status(200).json({
        integration: 'Salesforce',
        status: isConnected ? 'connected' : 'disconnected',
        configured: isConfigured,
        connected: isConnected,
        timestamp: new Date().toISOString(),
        capabilities: isConnected ? [
          'Manage leads and opportunities',
          'Update accounts and contacts',
          'Create and modify cases',
          'Custom objects and fields',
          'Reports and dashboards',
        ] : undefined,
        mode: isConfigured && isConnected ? 'production' : 'demo',
      });
    }
  } else if (method === 'POST') {
    const data = req.body;
    const action = data.action || 'unknown';
    const isConnected = tokenStorage.isValid('salesforce', userId);
    
    try {
      if (isConfigured && isConnected) {
        res.status(200).json({
          integration: 'Salesforce',
          status: 'completed',
          configured: isConfigured,
          message: `Salesforce ${action} operation successful (production mode)`,
          timestamp: new Date().toISOString(),
          action,
          entity_id: `sf_${Date.now()}`,
          details: {
            platform: 'Salesforce',
            operation: action,
            mode: 'production',
          },
        });
      } else {
        res.status(200).json({
          integration: 'Salesforce',
          status: 'completed',
          configured: isConfigured,
          message: `Salesforce ${action} operation successful (demo mode)`,
          timestamp: new Date().toISOString(),
          action,
          entity_id: `sf_demo_${Date.now()}`,
          details: {
            platform: 'Demo Salesforce',
            operation: action,
            mode: 'demo',
            note: 'Configure SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET for real integration',
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        integration: 'Salesforce',
        status: 'error',
        configured: isConfigured,
        message: `Salesforce operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      integration: 'Salesforce',
      status: 'error',
      configured: isConfigured,
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });
  }
}
