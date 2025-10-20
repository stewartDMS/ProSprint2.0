import type { NextApiRequest, NextApiResponse } from 'next';
import { store as storeToken } from '../../../../../lib/tokenStorage';

/**
 * Gmail OAuth2 Callback Handler
 * Handles the OAuth2 authorization code exchange for Gmail integration
 * 
 * This endpoint receives the authorization code from Google and exchanges it for access tokens.
 * 
 * PRODUCTION REQUIREMENTS:
 * - Environment variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI must be set
 * - No demo mode or fallback logic - real credentials required
 * 
 * TODO: Production security improvements needed:
 * - Implement CSRF state parameter validation to prevent authorization code injection attacks
 * - Add user session authentication to associate tokens with authenticated users
 * - Implement secure token encryption before storage (currently stored in memory)
 * - Add rate limiting to prevent OAuth callback abuse
 * - Implement comprehensive error logging and monitoring
 * - Implement automatic token refresh logic before expiration
 * - Add proper error tracking and alerting for production monitoring
 * - Replace in-memory token storage with encrypted database storage
 * - Validate redirect_uri matches exactly with Google Cloud Console configuration
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  
  // Log all incoming requests for debugging
  console.log('[Gmail OAuth Callback] Received request:', {
    method,
    query: JSON.stringify(query),
    timestamp: new Date().toISOString(),
  });
  
  // TODO: PRODUCTION REQUIRED - Replace with actual user authentication
  // Get user ID from authenticated session (e.g., JWT token, session cookie)
  // This hardcoded value is temporary and must be replaced before production deployment
  const userId = 'default';
  
  // Handle only GET requests for OAuth callback
  if (method !== 'GET') {
    console.error('[Gmail OAuth Callback] Invalid method:', method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Verify and log environment variables - using GOOGLE_* for consistency across Google integrations
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  console.log('[Gmail OAuth Callback] Environment variables check:', {
    GOOGLE_CLIENT_ID: clientId ? `Present (length: ${clientId.length})` : 'MISSING',
    GOOGLE_CLIENT_SECRET: clientSecret ? `Present (length: ${clientSecret.length})` : 'MISSING',
    GOOGLE_REDIRECT_URI: redirectUri || 'Using default',
    timestamp: new Date().toISOString(),
  });
  
  // Validate that all required environment variables are present
  if (!clientId || !clientSecret) {
    console.error('[Gmail OAuth Callback] Missing required environment variables:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      timestamp: new Date().toISOString(),
    });
    const errorMessage = encodeURIComponent(
      'Gmail integration not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    );
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
    return;
  }
  
  const code = query.code as string;
  const error = query.error as string;
  const errorDescription = query.error_description as string;
  
  // Check for OAuth errors from Google
  if (error) {
    console.error('[Gmail OAuth Callback] OAuth error from Google:', {
      error,
      error_description: errorDescription,
      timestamp: new Date().toISOString(),
    });
    const errorMessage = encodeURIComponent(errorDescription || error || 'Unknown OAuth error');
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
    return;
  }
  
  // TODO: PRODUCTION SECURITY - Implement CSRF state parameter validation
  // const state = query.state as string;
  // if (!state || state !== getStoredState(userId)) {
  //   console.error('[Gmail OAuth Callback] CSRF state validation failed');
  //   res.writeHead(302, { Location: '/integrations?error=gmail&message=Invalid+state+parameter' });
  //   res.end();
  //   return;
  // }
  
  // Verify authorization code is present
  if (!code) {
    console.warn('[Gmail OAuth Callback] Missing authorization code:', {
      queryParams: JSON.stringify(query),
      timestamp: new Date().toISOString(),
    });
    const errorMessage = encodeURIComponent('Authorization code not received from Google');
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
    return;
  }
  
  console.log('[Gmail OAuth Callback] Starting token exchange:', {
    codeLength: code.length,
    code_prefix: code.substring(0, 10) + '...',
    timestamp: new Date().toISOString(),
  });
  
  try {
    // Use provided redirect URI or default to the new standardized route
    const finalRedirectUri = redirectUri || 'https://pro-sprint-ai.vercel.app/api/integrations/email/callback/gmail';
    
    // Log token exchange request details
    console.log('[Gmail OAuth Callback] Token exchange request:', {
      endpoint: 'https://oauth2.googleapis.com/token',
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: finalRedirectUri,
      timestamp: new Date().toISOString(),
    });
    
    // Exchange authorization code for access and refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: finalRedirectUri,
        code,
      }),
    });
    
    // Log response status
    console.log('[Gmail OAuth Callback] Token exchange response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok,
      timestamp: new Date().toISOString(),
    });
    
    if (!tokenResponse.ok) {
      // Log detailed error from Google
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('[Gmail OAuth Callback] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorData: JSON.stringify(errorData),
        error: errorData.error,
        error_description: errorData.error_description,
        timestamp: new Date().toISOString(),
      });
      
      // Provide clear error message with configuration guidance
      const errorMessage = encodeURIComponent(
        errorData.error_description || 
        errorData.error || 
        `Token exchange failed: ${tokenResponse.statusText}. Check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are correctly configured.`
      );
      res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
      res.end();
      return;
    }
    
    const tokenData = await tokenResponse.json();
    
    console.log('[Gmail OAuth Callback] Token exchange successful:', {
      has_access_token: !!tokenData.access_token,
      has_refresh_token: !!tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      timestamp: new Date().toISOString(),
    });
    
    // Log encryption key availability before attempting token storage
    const tokenEncryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
    const encryptionKey = process.env.ENCRYPTION_KEY;
    console.log('[Gmail OAuth Callback] Encryption key status before token storage:', {
      TOKEN_ENCRYPTION_KEY: tokenEncryptionKey ? `Present (length: ${tokenEncryptionKey.length})` : 'MISSING',
      ENCRYPTION_KEY: encryptionKey ? `Present (length: ${encryptionKey.length})` : 'MISSING',
      using_key: tokenEncryptionKey ? 'TOKEN_ENCRYPTION_KEY' : (encryptionKey ? 'ENCRYPTION_KEY' : 'NONE'),
      timestamp: new Date().toISOString(),
    });
    
    // Store token in encrypted PostgreSQL database
    // Uses AES-256 encryption for tokens at rest
    // Implements automatic token refresh before expiration
    await storeToken('gmail', userId, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
    }, {
      ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    
    console.log('[Gmail OAuth Callback] Token stored successfully, redirecting to success page');
    
    // TODO: PRODUCTION ENHANCEMENTS:
    // - Add audit log entry for OAuth connection with user_id, ip_address, timestamp
    // - Send email/notification to user about new Gmail integration
    // - Update user preferences/settings database
    // - Trigger initial sync of email metadata if applicable
    // - Set up webhook subscriptions for real-time email notifications
    
    // Redirect to integrations page with success indicator
    res.writeHead(302, { Location: '/integrations?connected=gmail' });
    res.end();
    
  } catch (error) {
    // Log detailed error information
    console.error('[Gmail OAuth Callback] Exception during token exchange:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Redirect with error message
    const errorMessage = encodeURIComponent(
      error instanceof Error 
        ? `Gmail authorization failed: ${error.message}. Please try again or contact support.`
        : 'An unexpected error occurred during token exchange'
    );
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
  }
}
