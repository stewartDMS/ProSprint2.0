/**
 * Token Storage Utility
 * Securely manages OAuth2 tokens for integrations
 * In production, this should be replaced with a database implementation
 */

interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
  token_type?: string;
}

// In-memory storage for demo (replace with database in production)
const tokenStore = new Map<string, OAuthToken>();

export const tokenStorage = {
  /**
   * Store OAuth token for a specific integration and user
   * @param integration - Integration name (e.g., 'hubspot', 'salesforce')
   * @param userId - User identifier (for multi-user systems)
   * @param token - OAuth token data
   */
  store(integration: string, userId: string, token: OAuthToken): void {
    const key = `${userId}:${integration}`;
    tokenStore.set(key, token);
  },

  /**
   * Retrieve OAuth token for a specific integration and user
   * @param integration - Integration name
   * @param userId - User identifier
   * @returns Token data or null if not found
   */
  get(integration: string, userId: string): OAuthToken | null {
    const key = `${userId}:${integration}`;
    return tokenStore.get(key) || null;
  },

  /**
   * Check if a token exists and is valid
   * @param integration - Integration name
   * @param userId - User identifier
   * @returns True if token exists and hasn't expired
   */
  isValid(integration: string, userId: string): boolean {
    const token = this.get(integration, userId);
    if (!token) return false;
    
    // Check expiration if expires_at is set
    if (token.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      return token.expires_at > now;
    }
    
    return true;
  },

  /**
   * Remove token for a specific integration and user
   * @param integration - Integration name
   * @param userId - User identifier
   */
  remove(integration: string, userId: string): void {
    const key = `${userId}:${integration}`;
    tokenStore.delete(key);
  },

  /**
   * Clear all tokens (for testing/development)
   */
  clearAll(): void {
    tokenStore.clear();
  }
};

export type { OAuthToken };
