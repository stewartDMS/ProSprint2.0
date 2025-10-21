# API Routing Fix for ProSprint 2.0

## Problem Statement

The Automation Dashboard prompt box was returning 404 errors when trying to run automation tasks in a split deployment scenario (frontend on Vercel, backend on Render).

## Root Cause

The PromptBox component was making API requests to relative URLs (e.g., `/api/openai`) which only work when the frontend and API routes are hosted on the same domain. In a split deployment with backend on Render, these requests were going to the wrong location.

## Solution Overview

Added support for the `NEXT_PUBLIC_API_BASE_URL` environment variable to allow the frontend to route API requests to an external backend URL.

## Changes Made

### 1. Updated PromptBox Component (`components/PromptBox.tsx`)

Added a `getApiUrl()` function that constructs the correct API URL based on the environment configuration:

```typescript
// Get API base URL from environment variable or use relative path
const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    // Remove trailing slash from base URL and leading slash from endpoint if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }
  // Use relative URL for same-origin requests
  return endpoint;
};
```

Updated both API calls:
1. OpenAI API: `const apiUrl = getApiUrl('/api/openai');`
2. Integration endpoints: `const apiUrl = getApiUrl(`/api/integrations/${integration}`);`

### 2. Updated Environment Variables (`.env.example`)

Added documentation for the new `NEXT_PUBLIC_API_BASE_URL` variable:

```bash
# API Base URL (optional - for split frontend/backend deployments)
# If your backend API is deployed separately (e.g., on Render), set this to the backend URL
# Leave empty or unset to use relative URLs (frontend and API routes on same domain)
# Example: https://your-backend-app.onrender.com
NEXT_PUBLIC_API_BASE_URL=
```

### 3. Updated README.md

Added documentation in the deployment section explaining:
- How to configure the split deployment
- When to use `NEXT_PUBLIC_API_BASE_URL`
- Backend environment setup on Render
- CORS configuration requirements

### 4. Created DEPLOYMENT_GUIDE.md

Comprehensive guide covering:
- Standard vs. split deployment architectures
- Step-by-step setup instructions
- Environment variable reference
- Troubleshooting common issues
- Debug checklist

## How It Works

### Standard Deployment (Default)

```
Frontend Request: /api/openai
↓
process.env.NEXT_PUBLIC_API_BASE_URL = undefined
↓
getApiUrl('/api/openai') returns '/api/openai'
↓
Fetch request to: https://your-app.vercel.app/api/openai
(relative URL, same domain)
```

### Split Deployment (with NEXT_PUBLIC_API_BASE_URL set)

```
Frontend Request: /api/openai
↓
process.env.NEXT_PUBLIC_API_BASE_URL = 'https://backend.onrender.com'
↓
getApiUrl('/api/openai') returns 'https://backend.onrender.com/api/openai'
↓
Fetch request to: https://backend.onrender.com/api/openai
(absolute URL, external backend)
```

## Deployment Configurations

### Configuration 1: Standard Deployment (Recommended)

**Architecture:**
```
Vercel (Frontend + API) → Render (PostgreSQL only)
```

**Environment Variables (Vercel):**
```bash
OPENAI_API_KEY=sk-your-key
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
# NEXT_PUBLIC_API_BASE_URL not set (uses relative URLs)
```

**Result:** All API requests go to Vercel API routes

### Configuration 2: Split Deployment

**Architecture:**
```
Vercel (Frontend only) → Render (Backend API + PostgreSQL)
```

**Environment Variables (Vercel - Frontend):**
```bash
NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://backend.onrender.com  # ← Routes API to Render
DATABASE_URL=postgresql://...
TOKEN_ENCRYPTION_KEY=...
```

**Environment Variables (Render - Backend):**
```bash
OPENAI_API_KEY=sk-your-key  # ← OpenAI key on backend
DATABASE_URL=postgresql://...
TOKEN_ENCRYPTION_KEY=...
NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app  # ← CORS
```

**Result:** Frontend API requests go to Render backend

## Benefits

1. **Flexibility**: Supports both deployment models without code changes
2. **Backward Compatible**: Existing deployments continue to work (default behavior unchanged)
3. **No 404 Errors**: API requests reach the correct backend in split deployments
4. **Real AI Responses**: OpenAI API key on backend enables real responses
5. **Simple Configuration**: Just set one environment variable to enable split deployment

## Testing

### Test 1: Standard Deployment (Local)
```bash
# No NEXT_PUBLIC_API_BASE_URL set
npm run dev
# Visit http://localhost:3000/dashboard
# Test prompt: "Hello, can you help me?"
# Expected: Uses local API route at /api/openai
```

### Test 2: Split Deployment (Simulated)
```bash
# Set environment variable
export NEXT_PUBLIC_API_BASE_URL=https://backend.onrender.com
npm run dev
# Visit http://localhost:3000/dashboard
# Test prompt: "Hello, can you help me?"
# Expected: Attempts to call https://backend.onrender.com/api/openai
```

### Test 3: API URL Logic
```bash
node /tmp/test-api-url-logic.js
# Tests various scenarios of the getApiUrl function
# All tests should pass
```

## Acceptance Criteria Status

✅ **No 404 error on prompt box actions**
- Added `NEXT_PUBLIC_API_BASE_URL` support to route requests correctly
- Both OpenAI and integration endpoints use the new routing logic

✅ **Prompt box receives real OpenAI responses via backend**
- Backend can be configured with `OPENAI_API_KEY` on Render
- Frontend routes requests to backend using `NEXT_PUBLIC_API_BASE_URL`

✅ **Environment variable setup and fetch logic updated for production**
- `getApiUrl()` function handles both standard and split deployments
- Fetch calls updated in both `handleSubmit` and `tryAutomation` functions

✅ **Document any required .env or deployment changes**
- Updated `.env.example` with new variable
- Updated `README.md` deployment section
- Created comprehensive `DEPLOYMENT_GUIDE.md`
- Created this `API_ROUTING_FIX.md` summary document

## Migration Guide

### For Existing Standard Deployments

**No action required.** The changes are backward compatible. Your deployment will continue to work exactly as before.

### For New Split Deployments

1. Deploy backend to Render with `OPENAI_API_KEY`
2. Set `NEXT_PUBLIC_API_BASE_URL` in Vercel to point to Render backend
3. Set `ALLOWED_ORIGINS` in Render to point to Vercel frontend
4. Test the prompt box to verify real OpenAI responses

## Troubleshooting

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting steps.

**Quick checks:**
- Is `NEXT_PUBLIC_API_BASE_URL` set correctly in Vercel?
- Is `OPENAI_API_KEY` set on the backend (Render)?
- Is `ALLOWED_ORIGINS` configured for CORS?
- Check browser console for actual API endpoint being called
- Verify backend `/api/health` returns 200 OK

## Files Changed

1. `components/PromptBox.tsx` - Added `getApiUrl()` function and updated API calls
2. `.env.example` - Added `NEXT_PUBLIC_API_BASE_URL` documentation
3. `README.md` - Updated deployment section with split deployment info
4. `DEPLOYMENT_GUIDE.md` - New comprehensive deployment guide
5. `API_ROUTING_FIX.md` - This document

## Code Quality

- ✅ Linting passed: `npm run lint` (no errors)
- ✅ Build passed: `npm run build` (successful)
- ✅ TypeScript compilation: No errors
- ✅ Dev server tested: Starts and runs correctly
- ✅ API health check: Returns 200 OK
- ✅ Logic tests: All URL routing scenarios pass

## Next Steps

1. Deploy changes to production
2. Configure `NEXT_PUBLIC_API_BASE_URL` if using split deployment
3. Test prompt box with real OpenAI API calls
4. Monitor for any issues
5. Update documentation if additional scenarios are discovered
