/**
 * Health Check / Status API Endpoint
 * 
 * Returns the status of critical environment variables and system health.
 * Useful for deployment verification and troubleshooting.
 * 
 * GET /api/health
 * 
 * Returns:
 * - Environment variable presence and validation status
 * - System health indicators
 * - Configuration warnings
 * 
 * Security Note: Does NOT expose actual values, only presence and format validation
 * 
 * @module api/health
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { setCorsHeaders } from '../../lib/cors';

interface EnvironmentVariableStatus {
  name: string;
  present: boolean;
  valid?: boolean;
  length?: number;
  format?: string;
  warning?: string;
}

interface HealthResponse {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  environment: {
    variables: EnvironmentVariableStatus[];
  };
  warnings: string[];
  errors: string[];
}

/**
 * Validate if a string is a valid 64-character hexadecimal string
 */
function isValidHexKey(key: string | undefined): boolean {
  if (!key) return false;
  return key.length === 64 && /^[0-9a-fA-F]+$/.test(key);
}

/**
 * Check encryption key status
 */
function checkEncryptionKey(): EnvironmentVariableStatus {
  const tokenKey = process.env.TOKEN_ENCRYPTION_KEY;
  const legacyKey = process.env.ENCRYPTION_KEY;
  
  const key = tokenKey || legacyKey;
  const keyName = tokenKey ? 'TOKEN_ENCRYPTION_KEY' : 'ENCRYPTION_KEY';
  
  if (!key) {
    return {
      name: 'TOKEN_ENCRYPTION_KEY / ENCRYPTION_KEY',
      present: false,
      valid: false,
      warning: 'No encryption key configured - token storage will not work'
    };
  }

  const valid = isValidHexKey(key);
  const status: EnvironmentVariableStatus = {
    name: keyName,
    present: true,
    valid,
    length: key.length,
    format: valid ? '64-char hex' : 'invalid format'
  };

  if (!valid) {
    if (key.length !== 64) {
      status.warning = `Key length is ${key.length}, expected 64 hex characters`;
    } else {
      status.warning = 'Key contains non-hexadecimal characters';
    }
  }

  return status;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: { variables: [] },
      warnings: [],
      errors: ['Method not allowed']
    });
    return;
  }

  const warnings: string[] = [];
  const errors: string[] = [];
  const variables: EnvironmentVariableStatus[] = [];

  // Check OPENAI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiStatus: EnvironmentVariableStatus = {
    name: 'OPENAI_API_KEY',
    present: !!openaiKey,
    valid: !!openaiKey && openaiKey.length > 0,
    length: openaiKey?.length
  };
  if (!openaiKey) {
    warnings.push('OPENAI_API_KEY not configured - AI features will run in demo mode');
  }
  variables.push(openaiStatus);

  // Check encryption keys
  const encryptionStatus = checkEncryptionKey();
  variables.push(encryptionStatus);
  if (!encryptionStatus.present) {
    errors.push('Encryption key not configured - OAuth token storage will fail');
  } else if (!encryptionStatus.valid) {
    errors.push(`Encryption key invalid: ${encryptionStatus.warning}`);
  }

  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  const dbStatus: EnvironmentVariableStatus = {
    name: 'DATABASE_URL',
    present: !!dbUrl,
    valid: !!dbUrl && dbUrl.includes('postgresql://'),
    format: dbUrl?.startsWith('postgresql://') ? 'PostgreSQL' : 'unknown'
  };
  if (!dbUrl) {
    warnings.push('DATABASE_URL not configured - token persistence will not work');
  } else if (!dbUrl.includes('postgresql://')) {
    warnings.push('DATABASE_URL format may be invalid - expected PostgreSQL connection string');
  }
  variables.push(dbStatus);

  // Check CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const corsStatus: EnvironmentVariableStatus = {
    name: 'ALLOWED_ORIGINS / NEXT_PUBLIC_BASE_URL',
    present: !!(allowedOrigins || baseUrl),
    format: allowedOrigins ? 'custom origins' : (baseUrl ? 'base URL' : 'wildcard (*)'),
  };
  if (!allowedOrigins && !baseUrl) {
    warnings.push('CORS not configured - using wildcard (*) which allows all origins');
  }
  variables.push(corsStatus);

  // Determine overall status
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  if (errors.length > 0) {
    status = 'error';
  } else if (warnings.length > 0) {
    status = 'warning';
  }

  // Log health check for monitoring
  console.log(`[Health Check] Status: ${status}, Warnings: ${warnings.length}, Errors: ${errors.length}`);

  res.status(200).json({
    status,
    timestamp: new Date().toISOString(),
    environment: {
      variables
    },
    warnings,
    errors
  });
}
