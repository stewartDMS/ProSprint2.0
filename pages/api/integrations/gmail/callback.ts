import type { NextApiRequest, NextApiResponse } from 'next';
import { store as storeToken } from '../../../../lib/tokenStorage';

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
  const userId = 'default';
  
  // Check environment variables - using GOOGLE_* for consistency across Google integrations
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  console.log('[Gmail OAuth Callback] Environment variables check:', {
    GOOGLE_CLIENT_ID: clientId ? `Present (${clientId.length} chars)` : 'MISSING',
    GOOGLE_CLIENT_SECRET: clientSecret ? `Present (${clientSecret.length} chars)` : 'MISSING',
    GOOGLE_REDIRECT_URI: redirectUri || 'Using default',
    timestamp: new Date().toISOString(),
  });
  
  // Handle only GET requests for OAuth callback
  if (method !== 'GET') {
    console.error('[Gmail OAuth Callback] Invalid method:', method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // Check for OAuth errors from Google
  const error = query.error as string;
  const errorDescription = query.error_description as string;
  
  if (error) {
    console.error('[Gmail OAuth Callback] OAuth error from Google:', {
      error,
      error_description: errorDescription,
      timestamp: new Date().toISOString(),
    });
    
    const errorMessage = encodeURIComponent(errorDescription || 'Gmail authorization failed');
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
    return;
  }
  
  const code = query.code as string;
  
  // Verify authorization code is present
  if (!code) {
    console.error('[Gmail OAuth Callback] Missing authorization code');
    const errorMessage = encodeURIComponent('Authorization code missing from callback');
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
    return;
  }
  
  console.log('[Gmail OAuth Callback] Authorization code received:', {
    code_prefix: code.substring(0, 10) + '...',
    code_length: code.length,
    timestamp: new Date().toISOString(),
  });
  
  // Verify required environment variables are configured
  if (!clientId || !clientSecret) {
    console.error('[Gmail OAuth Callback] Missing required environment variables:', {
      GOOGLE_CLIENT_ID: clientId ? 'present' : 'MISSING',
      GOOGLE_CLIENT_SECRET: clientSecret ? 'present' : 'MISSING',
      timestamp: new Date().toISOString(),
    });
    
    const errorMessage = encodeURIComponent(
      'Gmail integration not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    );
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
    return;
  }
  
  // Use provided redirect URI or default
  const finalRedirectUri = redirectUri || 'https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback';
  
  console.log('[Gmail OAuth Callback] Attempting token exchange:', {
    redirect_uri: finalRedirectUri,
    timestamp: new Date().toISOString(),
  });
  
  try {
    // Exchange authorization code for access token
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
    
    console.log('[Gmail OAuth Callback] Token exchange response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      timestamp: new Date().toISOString(),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('[Gmail OAuth Callback] Token exchange failed:', {
        status: tokenResponse.status,
        error: errorData,
        timestamp: new Date().toISOString(),
      });
      
      const errorMessage = encodeURIComponent(
        errorData.error_description || 
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
      timestamp: new Date().toISOString(),
    });
    
    // Store token in encrypted PostgreSQL database
    await storeToken('gmail', userId, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      scope: tokenData.scope,
    }, {
      ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    
    console.log('[Gmail OAuth Callback] Token stored successfully, redirecting to success page');
    
    // Redirect to integrations page with success
    res.writeHead(302, { Location: '/integrations?connected=gmail' });
    res.end();
    
  } catch (error) {
    console.error('[Gmail OAuth Callback] Unexpected error during token exchange:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    const errorMessage = encodeURIComponent(
      `Gmail authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`
    );
    res.writeHead(302, { Location: `/integrations?error=gmail&message=${errorMessage}` });
    res.end();
  }
}
