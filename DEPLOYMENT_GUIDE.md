# ProSprint 2.0 Deployment Guide

This guide covers deployment configurations for ProSprint 2.0, including how to fix API routing issues when deploying frontend and backend separately.

## Table of Contents

- [Standard Deployment (Recommended)](#standard-deployment-recommended)
- [Split Frontend/Backend Deployment](#split-frontendbackend-deployment)
- [Environment Variables Reference](#environment-variables-reference)
- [Troubleshooting](#troubleshooting)

## Standard Deployment (Recommended)

The recommended deployment architecture is to deploy the entire Next.js application (frontend + API routes) to a single platform like Vercel.

### Architecture

```
┌─────────────────────────┐         ┌──────────────────┐
│                         │         │                  │
│  Vercel                 │────────▶│  Render.com      │
│  (Frontend + API)       │         │  (PostgreSQL)    │
│                         │         │                  │
└─────────────────────────┘         └──────────────────┘
```

### Setup Steps

1. **Deploy PostgreSQL on Render**:
   - Create a PostgreSQL database on Render
   - Copy the External Database URL

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set environment variables (see [Environment Variables Reference](#environment-variables-reference))
   - Deploy

3. **Required Environment Variables**:
   ```bash
   # OpenAI API
   OPENAI_API_KEY=sk-your_openai_api_key
   
   # Database (from Render)
   DATABASE_URL=postgresql://user:password@hostname:port/database
   
   # Token encryption
   TOKEN_ENCRYPTION_KEY=your_64_char_hex_key
   
   # Base URL (your Vercel domain)
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   ```

4. **Verify**:
   - Visit `https://your-app.vercel.app/api/health` to check status
   - Test the AI Assistant prompt box on the dashboard

## Split Frontend/Backend Deployment

If you need to deploy the frontend and backend API separately (e.g., frontend on Vercel, backend on Render), follow these steps.

### When to Use This Configuration

- Your backend API is deployed separately from the frontend
- You're getting 404 errors when using the prompt box
- You have specific requirements for backend hosting (e.g., custom server configuration, background jobs)

### Architecture

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Vercel         │────────▶│  Render.com      │
│  (Frontend)     │  API    │  (Backend API +  │
│                 │ Calls   │   PostgreSQL)    │
│                 │         │                  │
└─────────────────┘         └──────────────────┘
```

### Setup Steps

#### Step 1: Deploy Backend to Render

1. **Create Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `prosprint-backend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free tier or higher

2. **Set Backend Environment Variables**:
   ```bash
   # OpenAI API
   OPENAI_API_KEY=sk-your_openai_api_key
   
   # Database (from Render PostgreSQL)
   DATABASE_URL=postgresql://user:password@hostname:port/database
   
   # Token encryption
   TOKEN_ENCRYPTION_KEY=your_64_char_hex_key
   
   # Frontend URL (for CORS and OAuth callbacks)
   NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

3. **Deploy and Note the URL**:
   - Deploy the service
   - Copy the backend URL (e.g., `https://prosprint-backend.onrender.com`)

#### Step 2: Deploy Frontend to Vercel

1. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Deploy normally

2. **Set Frontend Environment Variables**:
   ```bash
   # Base URL (your Vercel domain)
   NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
   
   # Backend API URL (CRITICAL - this routes API calls to Render)
   NEXT_PUBLIC_API_BASE_URL=https://prosprint-backend.onrender.com
   
   # Database (same as backend - needed for some frontend operations)
   DATABASE_URL=postgresql://user:password@hostname:port/database
   
   # Token encryption (same as backend)
   TOKEN_ENCRYPTION_KEY=your_64_char_hex_key
   ```

   **Key Point**: The `NEXT_PUBLIC_API_BASE_URL` environment variable tells the frontend to send all API requests to the Render backend instead of using local API routes.

#### Step 3: Update OAuth Redirect URIs

If using OAuth integrations, you'll need to update redirect URIs to point to your backend:

1. **For most OAuth apps**, update redirect URIs to use the **backend URL**:
   - Example: `https://prosprint-backend.onrender.com/api/integrations/google/callback`

2. **Some services** may require the frontend URL - check documentation for each integration.

#### Step 4: Verify

1. **Check Backend Health**:
   ```bash
   curl https://prosprint-backend.onrender.com/api/health
   ```

2. **Test Prompt Box**:
   - Visit your frontend: `https://your-frontend.vercel.app/dashboard`
   - Try sending a message in the AI Assistant
   - Should receive real OpenAI responses (not 404 errors)

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-proj-...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `TOKEN_ENCRYPTION_KEY` | 64-char hex key for token encryption | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for OAuth callbacks | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | **Split deployment only**. Set to Render backend URL to route API calls externally. Leave empty for standard deployment. |
| `ALLOWED_ORIGINS` | CORS allowed origins | Production CORS security. Set to frontend URL. |

### How NEXT_PUBLIC_API_BASE_URL Works

The `NEXT_PUBLIC_API_BASE_URL` environment variable controls where API requests are sent:

- **Not set or empty**: API calls use relative URLs (e.g., `/api/openai`)
  - Standard deployment: Frontend and API on same domain
  - Example: `https://your-app.vercel.app/api/openai`

- **Set to backend URL**: API calls use absolute URLs to backend
  - Split deployment: Frontend on Vercel, Backend on Render
  - Example: `https://prosprint-backend.onrender.com/api/openai`

The PromptBox component automatically uses this variable:

```typescript
const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}${endpoint}`;  // Use backend URL
  }
  return endpoint;  // Use relative URL
};
```

## Troubleshooting

### Issue: 404 Errors in Prompt Box

**Symptoms**:
- Clicking "Send" in the AI Assistant returns 404
- Browser console shows: `POST /api/openai 404`

**Solution**:
1. If using split deployment, ensure `NEXT_PUBLIC_API_BASE_URL` is set in Vercel
2. Verify backend is running: `curl https://your-backend.onrender.com/api/health`
3. Check that `OPENAI_API_KEY` is set on the backend (Render)

### Issue: CORS Errors

**Symptoms**:
- Browser console shows CORS policy errors
- API calls fail with "Access-Control-Allow-Origin" errors

**Solution**:
1. Set `ALLOWED_ORIGINS` on backend to your frontend URL
2. Verify frontend URL matches exactly (including https://)
3. Check that CORS headers are configured in `next.config.js`

### Issue: Demo Mode / No Real AI Responses

**Symptoms**:
- Prompt box returns: "Running in demo mode"
- No real OpenAI API responses

**Solution**:
1. **Standard deployment**: Set `OPENAI_API_KEY` in Vercel environment variables
2. **Split deployment**: Set `OPENAI_API_KEY` in Render environment variables (backend)
3. Verify key is correct and has credits: https://platform.openai.com/account/usage
4. Restart the application after setting the key

### Issue: OAuth Integrations Not Working

**Symptoms**:
- OAuth callback fails
- Integration shows "Not Connected" after authorization

**Solution**:
1. **Standard deployment**: Redirect URIs should point to Vercel
   - Example: `https://your-app.vercel.app/api/integrations/google/callback`

2. **Split deployment**: Redirect URIs should point to Render backend
   - Example: `https://prosprint-backend.onrender.com/api/integrations/google/callback`

3. Verify `NEXT_PUBLIC_BASE_URL` matches your callback domain
4. Check that credentials (CLIENT_ID, CLIENT_SECRET) are set correctly

### Debug Checklist

Run through this checklist if you encounter issues:

- [ ] Check `/api/health` endpoint returns 200 OK
- [ ] Verify all required environment variables are set
- [ ] Ensure `OPENAI_API_KEY` has credits
- [ ] Check browser console for errors
- [ ] Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly (if using split deployment)
- [ ] Test with a simple prompt: "Hello, can you help me?"
- [ ] Check Render logs for backend errors
- [ ] Verify CORS configuration matches your frontend URL

## Additional Resources

- [README.md](./README.md) - Full project documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration guide
- [.env.example](./.env.example) - Environment variables template
- [Vercel Documentation](https://vercel.com/docs) - Vercel deployment docs
- [Render Documentation](https://render.com/docs) - Render deployment docs

## Support

If you continue to experience issues:

1. Check the [GitHub Issues](https://github.com/stewartDMS/ProSprint2.0/issues)
2. Review application logs (Vercel/Render dashboard)
3. Open a new issue with:
   - Deployment configuration (standard vs split)
   - Error messages from browser console
   - Relevant environment variables (redact secrets)
   - Steps to reproduce
