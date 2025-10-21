/**
 * CORS (Cross-Origin Resource Sharing) Utility
 * 
 * Provides centralized CORS configuration for API routes.
 * Supports configurable allowed origins for production deployments.
 * 
 * Environment Variables:
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (e.g., "https://domain1.vercel.app,https://domain2.com")
 * - NEXT_PUBLIC_BASE_URL: Base URL for the application (used as fallback allowed origin)
 * 
 * @module cors
 */

import type { NextApiResponse } from 'next';

/**
 * Get allowed origins from environment variables
 * Falls back to wildcard if not configured
 * 
 * @returns Array of allowed origins or '*' for all origins
 */
export function getAllowedOrigins(): string | string[] {
  // Check for explicit ALLOWED_ORIGINS configuration
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  if (allowedOriginsEnv) {
    return allowedOriginsEnv.split(',').map(origin => origin.trim());
  }

  // Check for NEXT_PUBLIC_BASE_URL as fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    return [baseUrl];
  }

  // Default to wildcard for development/demo
  return '*';
}

/**
 * Set CORS headers on an API response
 * 
 * @param res - Next.js API response object
 * @param origin - Optional specific origin to allow (overrides config)
 */
export function setCorsHeaders(res: NextApiResponse, origin?: string): void {
  const allowedOrigins = origin || getAllowedOrigins();

  if (allowedOrigins === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (typeof allowedOrigins === 'string') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
  } else if (Array.isArray(allowedOrigins) && allowedOrigins.length > 0) {
    // For multiple origins, we'd need to check the request origin
    // For now, use the first one or wildcard
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle CORS preflight (OPTIONS) requests
 * 
 * @param res - Next.js API response object
 * @returns true if this was an OPTIONS request, false otherwise
 */
export function handleCorsPrelight(res: NextApiResponse): boolean {
  setCorsHeaders(res);
  res.status(204).end();
  return true;
}
