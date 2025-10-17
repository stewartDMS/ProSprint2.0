/**
 * Secure Token Storage using PostgreSQL
 * 
 * Replaces in-memory token storage with encrypted PostgreSQL storage.
 * Uses AES-256-GCM encryption for tokens at rest.
 * Implements automatic token refresh for OAuth2 providers.
 * 
 * Features:
 * - Persistent storage in PostgreSQL via Prisma ORM
 * - AES-256 encryption for sensitive token data
 * - Automatic token refresh before expiration
 * - Audit trail with timestamps and usage tracking
 * - Generic interface supporting all integrations
 * 
 * @module tokenStorage
 */

import { prisma } from './prisma';
import { encrypt, decrypt } from './encryption';
import { refreshToken, shouldRefreshToken } from './tokenRefresh';

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
  token_type?: string;
}

/**
 * Store OAuth token for a specific integration and user
 * 
 * @param provider - Provider name (e.g., 'gmail', 'outlook', 'hubspot')
 * @param userId - User identifier
 * @param token - OAuth token data
 * @param metadata - Optional metadata (IP address, user agent)
 */
export async function store(
  provider: string,
  userId: string,
  token: OAuthToken,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  try {
    // Encrypt sensitive token data
    const encryptedAccessToken = encrypt(token.access_token);
    const encryptedRefreshToken = token.refresh_token ? encrypt(token.refresh_token) : null;
    
    // Calculate expiration date
    const expiresAt = token.expires_at 
      ? new Date(token.expires_at * 1000)
      : null;
    
    // Upsert token (update if exists, create if not)
    await prisma.oAuthToken.upsert({
  where: {
    userId_provider: {
      userId,
      provider
    }
  },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: token.scope,
        tokenType: token.token_type,
        updatedAt: new Date(),
        lastUsed: new Date(),
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
      create: {
        userId,
        provider,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        scope: token.scope,
        tokenType: token.token_type,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
    
    console.log(`[TokenStorage] Token stored successfully for ${provider}:${userId}`);
  } catch (error) {
    console.error('[TokenStorage] Failed to store token:', error);
    throw new Error(
      `Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieve OAuth token for a specific integration and user
 * Automatically refreshes token if expired and refresh token is available
 * 
 * @param provider - Provider name
 * @param userId - User identifier
 * @param autoRefresh - Whether to automatically refresh expired tokens (default: true)
 * @returns Token data or null if not found
 */
export async function get(
  provider: string,
  userId: string,
  autoRefresh: boolean = true
): Promise<OAuthToken | null> {
  try {
    const record = await prisma.oAuthToken.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
    
    if (!record) {
      return null;
    }
    
    // Decrypt token data
    const decryptedAccessToken = decrypt(record.accessToken);
    const decryptedRefreshToken = record.refreshToken ? decrypt(record.refreshToken) : undefined;
    
    // Convert expiration to Unix timestamp
    const expiresAt = record.expiresAt ? Math.floor(record.expiresAt.getTime() / 1000) : undefined;
    
    // Check if token needs refresh
    if (autoRefresh && decryptedRefreshToken && shouldRefreshToken(expiresAt)) {
      console.log(`[TokenStorage] Token expiring soon, attempting refresh for ${provider}:${userId}`);
      
      try {
        const refreshedToken = await refreshToken(provider, decryptedRefreshToken);
        
        // Store the refreshed token
        await store(provider, userId, {
          access_token: refreshedToken.access_token,
          refresh_token: refreshedToken.refresh_token || decryptedRefreshToken,
          expires_at: Math.floor(Date.now() / 1000) + refreshedToken.expires_in,
          scope: refreshedToken.scope || record.scope || undefined,
          token_type: refreshedToken.token_type || record.tokenType || undefined,
        });
        
        console.log(`[TokenStorage] Token refreshed successfully for ${provider}:${userId}`);
        
        return {
          access_token: refreshedToken.access_token,
          refresh_token: refreshedToken.refresh_token || decryptedRefreshToken,
          expires_at: Math.floor(Date.now() / 1000) + refreshedToken.expires_in,
          scope: refreshedToken.scope || record.scope || undefined,
          token_type: refreshedToken.token_type || record.tokenType || undefined,
        };
      } catch (refreshError) {
        console.error(`[TokenStorage] Token refresh failed for ${provider}:${userId}:`, refreshError);
        // Fall through to return the existing (possibly expired) token
      }
    }
    
    // Update last used timestamp
    await prisma.oAuthToken.update({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      data: {
        lastUsed: new Date(),
      },
    });
    
    return {
      access_token: decryptedAccessToken,
      refresh_token: decryptedRefreshToken,
      expires_at: expiresAt,
      scope: record.scope || undefined,
      token_type: record.tokenType || undefined,
    };
  } catch (error) {
    console.error('[TokenStorage] Failed to retrieve token:', error);
    throw new Error(
      `Failed to retrieve token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if a token exists and is valid (not expired)
 * 
 * @param provider - Provider name
 * @param userId - User identifier
 * @returns True if token exists and hasn't expired
 */
export async function isValid(provider: string, userId: string): Promise<boolean> {
  try {
    const record = await prisma.oAuthToken.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      select: {
        expiresAt: true,
      },
    });
    
    if (!record) {
      return false;
    }
    
    // If no expiration set, assume valid
    if (!record.expiresAt) {
      return true;
    }
    
    // Check if token is still valid
    const now = new Date();
    return record.expiresAt > now;
  } catch (error) {
    console.error('[TokenStorage] Failed to check token validity:', error);
    return false;
  }
}

/**
 * Remove token for a specific integration and user
 * 
 * @param provider - Provider name
 * @param userId - User identifier
 */
export async function remove(provider: string, userId: string): Promise<void> {
  try {
    await prisma.oAuthToken.delete({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });
    
    console.log(`[TokenStorage] Token removed for ${provider}:${userId}`);
  } catch (error) {
    // Ignore if token doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      console.log(`[TokenStorage] Token not found for removal: ${provider}:${userId}`);
      return;
    }
    
    console.error('[TokenStorage] Failed to remove token:', error);
    throw new Error(
      `Failed to remove token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Clear all tokens for a user (for testing/development)
 * 
 * @param userId - User identifier
 */
export async function clearAllForUser(userId: string): Promise<void> {
  try {
    await prisma.oAuthToken.deleteMany({
      where: {
        userId,
      },
    });
    
    console.log(`[TokenStorage] All tokens cleared for user: ${userId}`);
  } catch (error) {
    console.error('[TokenStorage] Failed to clear tokens:', error);
    throw new Error(
      `Failed to clear tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Clear all tokens (for testing/development only)
 * WARNING: This will delete all tokens in the database
 */
export async function clearAll(): Promise<void> {
  try {
    await prisma.oAuthToken.deleteMany();
    console.log('[TokenStorage] All tokens cleared from database');
  } catch (error) {
    console.error('[TokenStorage] Failed to clear all tokens:', error);
    throw new Error(
      `Failed to clear all tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Export the token storage interface
export const tokenStorage = {
  store,
  get,
  isValid,
  remove,
  clearAll: clearAllForUser, // Default to clearing user tokens, not all
};
