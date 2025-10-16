/**
 * Example API Route for Secure OAuth Token Storage
 * 
 * Demonstrates how to securely store and retrieve encrypted OAuth tokens
 * using Prisma ORM and AES-256-GCM encryption.
 * 
 * This is an example route that can be adapted for real integrations.
 * 
 * Endpoints:
 * - POST /api/tokens: Store a new OAuth token
 * - GET /api/tokens?userId={userId}&integration={integration}: Retrieve a token
 * 
 * Security Features:
 * - Tokens are encrypted at rest using AES-256-GCM
 * - Uses TOKEN_ENCRYPTION_KEY from environment variables
 * - Validates required fields
 * - Returns proper error messages
 * 
 * @module api/tokens
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { store, get, OAuthToken } from '../../lib/tokenStorage';

/**
 * API Response types
 */
type SuccessResponse = {
  success: true;
  message: string;
  data?: OAuthToken | null;
};

type ErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * POST Request Body type
 */
interface StoreTokenRequest {
  userId: string;
  integration: string;
  token: {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    scope?: string;
    token_type?: string;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Main API handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Check if encryption is configured
  try {
    if (!process.env.TOKEN_ENCRYPTION_KEY && !process.env.ENCRYPTION_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: 'TOKEN_ENCRYPTION_KEY environment variable is not set',
      });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: 'DATABASE_URL environment variable is not set',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Route to appropriate handler based on HTTP method
  switch (req.method) {
    case 'POST':
      return handlePost(req, res);
    case 'GET':
      return handleGet(req, res);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        details: `HTTP method ${req.method} is not supported. Use POST or GET.`,
      });
  }
}

/**
 * Handle POST request - Store a new OAuth token
 * 
 * Example request body:
 * {
 *   "userId": "user123",
 *   "integration": "gmail",
 *   "token": {
 *     "access_token": "ya29.a0AfH6SMB...",
 *     "refresh_token": "1//0gZx...",
 *     "expires_at": 1234567890,
 *     "scope": "https://www.googleapis.com/auth/gmail.readonly",
 *     "token_type": "Bearer"
 *   },
 *   "metadata": {
 *     "ipAddress": "192.168.1.1",
 *     "userAgent": "Mozilla/5.0..."
 *   }
 * }
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  try {
    // Parse and validate request body
    const body = req.body as StoreTokenRequest;

    // Validate required fields
    if (!body.userId) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: 'userId is required',
      });
    }

    if (!body.integration) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: 'integration is required',
      });
    }

    if (!body.token || !body.token.access_token) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: 'token.access_token is required',
      });
    }

    // Extract metadata from request if not provided
    const metadata = body.metadata || {
      ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // Store the token
    await store(body.integration, body.userId, body.token, metadata);

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Token stored successfully for ${body.integration}:${body.userId}`,
    });
  } catch (error) {
    console.error('[API /api/tokens POST] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to store token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle GET request - Retrieve a stored OAuth token
 * 
 * Query parameters:
 * - userId: User identifier (required)
 * - integration: Integration name (required)
 * - autoRefresh: Whether to auto-refresh expired tokens (optional, default: true)
 * 
 * Example: GET /api/tokens?userId=user123&integration=gmail
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  try {
    // Parse and validate query parameters
    const { userId, integration, autoRefresh } = req.query;

    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: 'userId query parameter is required',
      });
    }

    if (!integration || typeof integration !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: 'integration query parameter is required',
      });
    }

    // Parse autoRefresh parameter (default: true)
    const shouldAutoRefresh = autoRefresh === 'false' ? false : true;

    // Retrieve the token
    const token = await get(integration, userId, shouldAutoRefresh);

    if (!token) {
      return res.status(404).json({
        success: false,
        error: 'Token not found',
        details: `No token found for ${integration}:${userId}`,
      });
    }

    // Return the decrypted token
    return res.status(200).json({
      success: true,
      message: `Token retrieved successfully for ${integration}:${userId}`,
      data: token,
    });
  } catch (error) {
    console.error('[API /api/tokens GET] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
