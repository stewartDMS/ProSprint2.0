import type { NextApiRequest, NextApiResponse } from 'next';
import { tokenStorage } from '../../../utils/tokenStorage';

/**
 * Microsoft OAuth2 Callback Handler
 * Handles the OAuth2 authorization code exchange for Microsoft/Outlook integration
 * 
 * This endpoint receives the authorization code from Microsoft and exchanges it for access tokens
 * 
 * TODO: Production security improvements needed:
 * - Implement CSRF state parameter validation
 * - Add user session authentication
 * - Implement secure token encryption before storage
 * - Add rate limiting to prevent abuse
 * - Log OAuth errors for monitoring
 * - Implement token refresh logic
 * - Add proper error tracking/alerting
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  
  // TODO: In production, get user ID from authenticated session
  // Currently using 'default' for demo/development purposes
  const userId = 'default';
  
  // Check if Microsoft OAuth2 credentials are configured
  const isConfigured = Boolean(
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
  );

  if (method === 'GET') {
    const code = query.code as string;
    
    // TODO: Add CSRF state validation
    // const state = query.state as string;
    // Verify state matches the one sent in authorization request
    
    if (code && isConfigured) {
      try {
        // Exchange authorization code for access and refresh tokens
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
            // Use the same redirect_uri as specified in the OAuth authorization flow
            redirect_uri: process.env.MICROSOFT_REDIRECT_URI || 'https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft',
            code,
          }),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          // TODO: Production improvements for token storage:
          // - Encrypt tokens before storing
          // - Store in secure database instead of in-memory
          // - Associate with authenticated user ID
          // - Store token metadata (scopes, issued_at, etc.)
          // - Implement automatic token refresh before expiration
          
          // Store token securely using tokenStorage utility
          // This is a placeholder - in production, use encrypted database storage
          tokenStorage.store('outlook', userId, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
            scope: tokenData.scope,
            token_type: tokenData.token_type,
          });
          
          // TODO: Production enhancements:
          // - Log successful OAuth connection for audit trail
          // - Send notification to user about new connection
          // - Update user preferences/settings
          
          // Redirect to integrations page with success indicator
          res.writeHead(302, { Location: '/integrations?connected=outlook' });
          res.end();
          return;
        } else {
          // TODO: Add detailed error logging
          const errorData = await tokenResponse.json().catch(() => ({}));
          console.error('Microsoft token exchange failed:', errorData);
        }
      } catch (error) {
        // TODO: Production error handling:
        // - Log error with context for debugging
        // - Send error notification to monitoring service
        // - Provide user-friendly error message
        console.error('Microsoft OAuth error:', error);
      }
    } else if (!code) {
      // TODO: Log missing authorization code
      console.warn('Microsoft OAuth callback received without code parameter');
    } else if (!isConfigured) {
      // TODO: Log configuration error
      console.warn('Microsoft OAuth not configured - missing client credentials');
    }
    
    // Fallback for demo mode or error
    // Redirect to integrations page with error indicator
    res.writeHead(302, { Location: '/integrations?error=outlook' });
    res.end();
  } else {
    // Only GET method is supported for OAuth callbacks
    res.status(405).json({ error: 'Method not allowed' });
  }
}
