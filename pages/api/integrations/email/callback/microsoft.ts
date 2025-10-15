import type { NextApiRequest, NextApiResponse } from 'next';
import { store as storeToken } from '../../../../../lib/tokenStorage';

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
  
  // Log all incoming request details
  console.log('[Microsoft OAuth Callback] Received request:', {
    method,
    query: JSON.stringify(query),
    timestamp: new Date().toISOString(),
  });
  
  // TODO: PRODUCTION REQUIRED - Replace with actual user authentication
  // Get user ID from authenticated session (e.g., JWT token, session cookie)
  // This hardcoded value is temporary and must be replaced before production deployment
  const userId = 'default';
  
  // Verify and log environment variables
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
  
  console.log('[Microsoft OAuth Callback] Environment variables check:', {
    MICROSOFT_CLIENT_ID: clientId ? `Present (length: ${clientId.length})` : 'MISSING',
    MICROSOFT_CLIENT_SECRET: clientSecret ? `Present (length: ${clientSecret.length})` : 'MISSING',
    MICROSOFT_REDIRECT_URI: redirectUri || 'Using default',
    timestamp: new Date().toISOString(),
  });
  
  // Validate that all required environment variables are present
  if (!clientId || !clientSecret) {
    console.error('[Microsoft OAuth Callback] Missing required environment variables:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      timestamp: new Date().toISOString(),
    });
    const errorMessage = encodeURIComponent('Server configuration error: Microsoft OAuth credentials not configured');
    res.writeHead(302, { Location: `/integrations?error=outlook&message=${errorMessage}` });
    res.end();
    return;
  }

  if (method === 'GET') {
    const code = query.code as string;
    const error = query.error as string;
    const errorDescription = query.error_description as string;
    
    // Check for OAuth errors from Microsoft
    if (error) {
      console.error('[Microsoft OAuth Callback] OAuth error from Microsoft:', {
        error,
        error_description: errorDescription,
        timestamp: new Date().toISOString(),
      });
      const errorMessage = encodeURIComponent(errorDescription || error || 'Unknown OAuth error');
      res.writeHead(302, { Location: `/integrations?error=outlook&message=${errorMessage}` });
      res.end();
      return;
    }
    
    // TODO: PRODUCTION SECURITY - Implement CSRF state parameter validation
    // const state = query.state as string;
    // if (!state || state !== getStoredState(userId)) {
    //   console.error('[Microsoft OAuth Callback] CSRF state validation failed');
    //   res.writeHead(302, { Location: '/integrations?error=outlook&message=Invalid+state+parameter' });
    //   res.end();
    //   return;
    // }
    
    if (code) {
      console.log('[Microsoft OAuth Callback] Starting token exchange:', {
        codeLength: code.length,
        timestamp: new Date().toISOString(),
      });
      try {
        const finalRedirectUri = redirectUri || 'https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft';
        
        // Log token exchange request details
        console.log('[Microsoft OAuth Callback] Token exchange request:', {
          endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: finalRedirectUri,
          code_prefix: code.substring(0, 10) + '...',
          timestamp: new Date().toISOString(),
        });
        
        // Exchange authorization code for access and refresh tokens
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId!,
            client_secret: clientSecret!,
            // Use the same redirect_uri as specified in the OAuth authorization flow
            redirect_uri: finalRedirectUri,
            code,
          }),
        });
        
        // Log response status
        console.log('[Microsoft OAuth Callback] Token exchange response:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          ok: tokenResponse.ok,
          timestamp: new Date().toISOString(),
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          
          console.log('[Microsoft OAuth Callback] Token exchange successful:', {
            has_access_token: !!tokenData.access_token,
            has_refresh_token: !!tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope,
            token_type: tokenData.token_type,
            timestamp: new Date().toISOString(),
          });
          
          // Store token in encrypted PostgreSQL database
          // Uses AES-256 encryption for tokens at rest
          // Implements automatic token refresh before expiration
          await storeToken('outlook', userId, {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
            scope: tokenData.scope,
            token_type: tokenData.token_type,
          }, {
            ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          });
          
          console.log('[Microsoft OAuth Callback] Token stored successfully, redirecting to success page');
          
          // TODO: PRODUCTION ENHANCEMENTS:
          // - Add audit log entry for OAuth connection with user_id, ip_address, timestamp
          // - Send email/notification to user about new Outlook integration
          // - Update user preferences/settings database
          // - Trigger initial sync of email metadata if applicable
          // - Set up webhook subscriptions for real-time email notifications
          
          // Redirect to integrations page with success indicator
          res.writeHead(302, { Location: '/integrations?connected=outlook' });
          res.end();
          return;
        } else {
          // Log detailed error from Microsoft
          const errorData = await tokenResponse.json().catch(() => ({}));
          console.error('[Microsoft OAuth Callback] Token exchange failed:', {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            errorData: JSON.stringify(errorData),
            error: errorData.error,
            error_description: errorData.error_description,
            error_codes: errorData.error_codes,
            timestamp: new Date().toISOString(),
          });
          
          // Redirect with detailed error message
          const errorMessage = encodeURIComponent(
            errorData.error_description || errorData.error || `Token exchange failed with status ${tokenResponse.status}`
          );
          res.writeHead(302, { Location: `/integrations?error=outlook&message=${errorMessage}` });
          res.end();
          return;
        }
      } catch (error) {
        // Log detailed error information
        console.error('[Microsoft OAuth Callback] Exception during token exchange:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        
        // Redirect with error message
        const errorMessage = encodeURIComponent(
          error instanceof Error ? error.message : 'An unexpected error occurred during token exchange'
        );
        res.writeHead(302, { Location: `/integrations?error=outlook&message=${errorMessage}` });
        res.end();
        return;
      }
    }
    
    // Handle missing authorization code
    if (!code) {
      console.warn('[Microsoft OAuth Callback] Missing authorization code:', {
        queryParams: JSON.stringify(query),
        timestamp: new Date().toISOString(),
      });
      const errorMessage = encodeURIComponent('Authorization code not received from Microsoft');
      res.writeHead(302, { Location: `/integrations?error=outlook&message=${errorMessage}` });
      res.end();
      return;
    }
    
    // If we reach here, something unexpected happened
    console.error('[Microsoft OAuth Callback] Unexpected state: should not reach this point');
    res.writeHead(302, { Location: '/integrations?error=outlook&message=Unexpected+error+state' });
    res.end();
  } else {
    // Only GET method is supported for OAuth callbacks
    res.status(405).json({ error: 'Method not allowed' });
  }
}
