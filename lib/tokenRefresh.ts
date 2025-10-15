/**
 * OAuth Token Refresh Utilities
 * 
 * Provides automatic token refresh logic for OAuth2 providers.
 * Supports Gmail (Google) and Outlook (Microsoft) integrations.
 * 
 * @module tokenRefresh
 */

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

/**
 * Refresh a Google OAuth2 token
 * 
 * @param refreshToken - The refresh token to use
 * @returns New token data
 * @throws Error if refresh fails
 */
export async function refreshGoogleToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Google token refresh failed: ${errorData.error_description || errorData.error || response.statusText}`
    );
  }
  
  return await response.json();
}

/**
 * Refresh a Microsoft OAuth2 token
 * 
 * @param refreshToken - The refresh token to use
 * @returns New token data
 * @throws Error if refresh fails
 */
export async function refreshMicrosoftToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured');
  }
  
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Microsoft token refresh failed: ${errorData.error_description || errorData.error || response.statusText}`
    );
  }
  
  return await response.json();
}

/**
 * Refresh a token for any supported integration
 * 
 * @param integration - Integration name (e.g., 'gmail', 'outlook')
 * @param refreshToken - The refresh token to use
 * @returns New token data
 * @throws Error if integration is not supported or refresh fails
 */
export async function refreshToken(
  integration: string,
  refreshToken: string
): Promise<RefreshTokenResponse> {
  switch (integration.toLowerCase()) {
    case 'gmail':
      return refreshGoogleToken(refreshToken);
    
    case 'outlook':
      return refreshMicrosoftToken(refreshToken);
    
    default:
      throw new Error(`Token refresh not implemented for integration: ${integration}`);
  }
}

/**
 * Check if a token needs refresh (expires in less than 5 minutes)
 * 
 * @param expiresAt - Token expiration timestamp (Unix timestamp in seconds or Date)
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(expiresAt: number | Date | null | undefined): boolean {
  if (!expiresAt) {
    return false; // No expiration time, assume valid
  }
  
  const expirationTime = expiresAt instanceof Date 
    ? expiresAt.getTime() / 1000 
    : expiresAt;
  
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  
  return (expirationTime - now) < fiveMinutes;
}
