/**
 * Token Storage Utility
 * 
 * This module now uses PostgreSQL with AES-256 encryption for secure token storage.
 * Replaces the previous in-memory storage with persistent database storage.
 * 
 * Features:
 * - PostgreSQL database storage via Prisma ORM
 * - AES-256-GCM encryption for tokens at rest
 * - Automatic token refresh for OAuth2 providers
 * - Audit trail and usage tracking
 * - Generic interface for all integrations
 * 
 * IMPORTANT: This module provides both synchronous and asynchronous interfaces
 * for backward compatibility. New code should use the async versions directly
 * from lib/tokenStorage.ts
 */

import {
  tokenStorage as dbTokenStorage,
  store as dbStore,
  get as dbGet,
  isValid as dbIsValid,
  remove as dbRemove,
  clearAllForUser as dbClearAllForUser,
  type OAuthToken
} from '../../../lib/tokenStorage';

/**
 * Synchronous wrapper that logs a warning and provides fallback behavior
 * This is for backward compatibility with existing synchronous code
 */
export const tokenStorage = {
  /**
   * Store OAuth token for a specific integration and user
   * 
   * NOTE: This is a synchronous wrapper for backward compatibility.
   * The actual storage operation is asynchronous. Consider using the async
   * version from lib/tokenStorage.ts for new code.
   * 
   * @param integration - Integration name (e.g., 'gmail', 'outlook', 'hubspot')
   * @param userId - User identifier
   * @param token - OAuth token data
   */
  store(integration: string, userId: string, token: OAuthToken): void {
    // Fire and forget - log any errors
    dbStore(integration, userId, token).catch((error) => {
      console.error('[TokenStorage] Error storing token:', error);
    });
  },

  /**
   * Retrieve OAuth token for a specific integration and user
   * 
   * NOTE: This synchronous method cannot retrieve tokens from the database.
   * Use the async version from lib/tokenStorage.ts instead.
   * 
   * @param integration - Integration name
   * @param userId - User identifier
   * @returns null (cannot retrieve synchronously from database)
   * @deprecated Use async get() from lib/tokenStorage.ts
   */
  get(integration: string, userId: string): OAuthToken | null {
    console.warn(
      '[TokenStorage] Synchronous get() is deprecated. Use async get() from lib/tokenStorage.ts'
    );
    return null;
  },

  /**
   * Check if a token exists and is valid
   * 
   * NOTE: This synchronous method cannot check the database.
   * Use the async version from lib/tokenStorage.ts instead.
   * 
   * @param integration - Integration name
   * @param userId - User identifier
   * @returns false (cannot check synchronously from database)
   * @deprecated Use async isValid() from lib/tokenStorage.ts
   */
  isValid(integration: string, userId: string): boolean {
    console.warn(
      '[TokenStorage] Synchronous isValid() is deprecated. Use async isValid() from lib/tokenStorage.ts'
    );
    return false;
  },

  /**
   * Remove token for a specific integration and user
   * 
   * NOTE: This is a synchronous wrapper for backward compatibility.
   * The actual removal operation is asynchronous.
   * 
   * @param integration - Integration name
   * @param userId - User identifier
   */
  remove(integration: string, userId: string): void {
    // Fire and forget - log any errors
    dbRemove(integration, userId).catch((error) => {
      console.error('[TokenStorage] Error removing token:', error);
    });
  },

  /**
   * Clear all tokens for a user
   * 
   * NOTE: This is a synchronous wrapper for backward compatibility.
   * The actual clear operation is asynchronous.
   */
  clearAll(): void {
    console.warn(
      '[TokenStorage] clearAll() called - this will be ignored. Use async clearAllForUser() from lib/tokenStorage.ts'
    );
  }
};

// Re-export the async token storage functions for direct use
export {
  dbStore as storeAsync,
  dbGet as getAsync,
  dbIsValid as isValidAsync,
  dbRemove as removeAsync,
  dbClearAllForUser as clearAllForUserAsync,
};

export type { OAuthToken };
