import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Gmail Integration API Handler
 * 
 * PRODUCTION MODE ONLY - No demo or fallback logic.
 * Requires real Google OAuth2 credentials to function.
 * 
 * Environment Variables Required:
 * - GOOGLE_CLIENT_ID: OAuth2 client ID from Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: OAuth2 client secret from Google Cloud Console
 * - GOOGLE_REDIRECT_URI: Authorized redirect URI (defaults to production URL)
 * 
 * TODO: Production improvements needed:
 * - Implement user session authentication
 * - Add real Gmail API integration for sending emails
 * - Implement token refresh logic
 * - Add rate limiting and quota management
 * - Replace in-memory token storage with encrypted database
 * - Add comprehensive error tracking and monitoring
 * - Implement CSRF protection for OAuth flow
 */

interface GmailResponse {
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
  res: NextApiResponse<GmailResponse>
) {
  const { method, query } = req;
  
  // TODO: PRODUCTION REQUIRED - Replace with actual user authentication
  const userId = 'default';
  
  // Check for required environment variables (using GOOGLE_* for consistency)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  const isConfigured = Boolean(clientId && clientSecret);
  
  if (method === 'GET') {
    const action = query.action as string || 'status';
    
    if (action === 'connect') {
      // Require real credentials - no demo mode
      if (!isConfigured) {
        res.status(400).json({
          integration: 'Gmail',
          status: 'error',
          configured: false,
          timestamp: new Date().toISOString(),
          message: 'Gmail integration not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables. Demo mode is not available for Gmail integration.',
        });
        return;
      }
      
      // Build OAuth2 authorization URL
      const finalRedirectUri = redirectUri || 'https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback';
      const scope = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
      
      res.status(200).json({
        integration: 'Gmail',
        status: 'redirect',
        configured: true,
        timestamp: new Date().toISOString(),
        auth_url: authUrl,
        message: 'Redirect user to auth_url to authorize Gmail access',
      });
    } else if (action === 'callback') {
      // NOTE: This callback action is deprecated. Use /api/integrations/gmail/callback.ts instead.
      // This is kept for backwards compatibility but should not be used.
      console.warn('[Gmail Integration] Deprecated callback action called. Use /api/integrations/gmail/callback.ts instead.');
      
      res.status(400).json({
        integration: 'Gmail',
        status: 'error',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        message: 'This callback endpoint is deprecated. OAuth callback should go to /api/integrations/gmail/callback',
      });
    } else if (action === 'disconnect') {
      // Remove stored tokens
      tokenStorage.remove('gmail', userId);
      res.status(200).json({
        integration: 'Gmail',
        status: 'disconnected',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        message: 'Gmail disconnected successfully',
      });
    } else {
      // Default status action
      const isConnected = tokenStorage.isValid('gmail', userId);
      
      // Return error if not configured
      if (!isConfigured) {
        res.status(400).json({
          integration: 'Gmail',
          status: 'error',
          configured: false,
          connected: false,
          timestamp: new Date().toISOString(),
          message: 'Gmail integration not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
        });
        return;
      }
      
      res.status(200).json({
        integration: 'Gmail',
        status: isConnected ? 'connected' : 'disconnected',
        configured: true,
        connected: isConnected,
        timestamp: new Date().toISOString(),
        capabilities: isConnected ? [
          'Send emails',
          'Read emails',
          'Manage labels',
          'Search inbox',
          'Automated responses',
        ] : undefined,
        message: isConnected 
          ? 'Gmail connected and ready to use' 
          : 'Gmail configured but not connected. Use the connect action to authorize.',
      });
    }
  } else if (method === 'POST') {
    const data = req.body;
    const action = data.action || 'send';
    
    // Verify configuration
    if (!isConfigured) {
      res.status(400).json({
        integration: 'Gmail',
        status: 'error',
        configured: false,
        message: 'Gmail integration not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    const isConnected = tokenStorage.isValid('gmail', userId);
    
    // Verify connection
    if (!isConnected) {
      res.status(401).json({
        integration: 'Gmail',
        status: 'error',
        configured: true,
        message: 'Gmail not connected. Please authorize the integration first by calling the connect action.',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    try {
      // TODO: PRODUCTION REQUIRED - Implement real Gmail API integration
      // Get the stored token
      const token = tokenStorage.get('gmail', userId);
      
      if (!token) {
        res.status(401).json({
          integration: 'Gmail',
          status: 'error',
          configured: true,
          message: 'Gmail token not found. Please re-authorize the integration.',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      // TODO: Implement token refresh if expired
      // TODO: Make real API call to Gmail
      // Example implementation:
      // const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token.access_token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     raw: createEmailMessage(data.recipient, data.subject, data.body)
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Gmail API error: ${errorData.error?.message || response.statusText}`);
      // }
      // 
      // const result = await response.json();
      
      // For now, return success with a note that real API integration is needed
      res.status(200).json({
        integration: 'Gmail',
        status: 'pending',
        configured: true,
        message: `Gmail ${action} operation ready but real API integration not yet implemented. Token is valid and stored.`,
        timestamp: new Date().toISOString(),
        action,
        entity_id: `gmail_${Date.now()}`,
        details: {
          platform: 'Gmail',
          operation: action,
          recipient: data.recipient,
          subject: data.subject,
          note: 'TODO: Implement real Gmail API call using the stored OAuth token',
        },
      });
    } catch (error) {
      console.error('[Gmail Integration] Operation failed:', error);
      res.status(500).json({
        integration: 'Gmail',
        status: 'error',
        configured: true,
        message: `Gmail operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      integration: 'Gmail',
      status: 'error',
      configured: isConfigured,
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });
  }
}
