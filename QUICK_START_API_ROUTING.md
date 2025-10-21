# Quick Start: API Routing Configuration

> **TL;DR**: Set `NEXT_PUBLIC_API_BASE_URL` in Vercel to route API calls to a separate backend on Render.

## Architecture Comparison

### Standard Deployment
```
┌─────────────────────────────┐
│   User's Browser            │
│   https://app.vercel.app    │
└──────────────┬──────────────┘
               │
               │ fetch('/api/openai')
               │ → https://app.vercel.app/api/openai
               ↓
┌─────────────────────────────┐       ┌──────────────┐
│   Vercel                    │──────→│  Render      │
│   - Frontend (React/Next)   │       │  PostgreSQL  │
│   - API Routes (/api/*)     │       └──────────────┘
│   - OPENAI_API_KEY here     │
└─────────────────────────────┘
```

### Split Deployment
```
┌─────────────────────────────┐
│   User's Browser            │
│   https://app.vercel.app    │
└──────────────┬──────────────┘
               │
               │ fetch('/api/openai')
               │ → https://backend.onrender.com/api/openai
               │ (via NEXT_PUBLIC_API_BASE_URL)
               ↓
┌──────────────┐             ┌─────────────────────────┐
│  Vercel      │             │  Render                 │
│  Frontend    │             │  - API Routes (/api/*)  │
│  React/Next  │             │  - OPENAI_API_KEY here  │
│              │             │  - PostgreSQL DB        │
└──────────────┘             └─────────────────────────┘
```

## For Standard Deployment (Frontend + API on Vercel)

**No configuration needed!** Just deploy to Vercel normally.

```bash
# Required env vars on Vercel:
OPENAI_API_KEY=sk-your-key
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# NEXT_PUBLIC_API_BASE_URL is NOT needed - leave it empty or unset
```

API calls will use relative URLs: `/api/openai` → `https://your-app.vercel.app/api/openai`

---

## For Split Deployment (Frontend on Vercel, Backend on Render)

### Backend (Render)

Deploy your app to Render with:

```bash
# Build: npm install && npm run build
# Start: npm start

# Environment Variables:
OPENAI_API_KEY=sk-your-key              # ← OpenAI key goes here!
DATABASE_URL=postgresql://...
TOKEN_ENCRYPTION_KEY=...
NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app  # ← CORS!
```

### Frontend (Vercel)

Deploy to Vercel with:

```bash
# Environment Variables:
NEXT_PUBLIC_BASE_URL=https://your-frontend.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com  # ← This routes API calls!
DATABASE_URL=postgresql://...
TOKEN_ENCRYPTION_KEY=...
```

API calls will use absolute URLs: `/api/openai` → `https://your-backend.onrender.com/api/openai`

---

## Testing

### Test Standard Deployment
```bash
# Start local dev server
npm run dev

# Visit http://localhost:3000/dashboard
# Try prompt: "Hello, can you help me?"
# API call goes to: http://localhost:3000/api/openai ✓
```

### Test Split Deployment (Local)
```bash
# Set backend URL
export NEXT_PUBLIC_API_BASE_URL=https://backend.onrender.com

# Start dev server
npm run dev

# Visit http://localhost:3000/dashboard
# Try prompt: "Hello, can you help me?"
# API call goes to: https://backend.onrender.com/api/openai ✓
```

---

## Troubleshooting

### ❌ Still getting 404 errors?

1. **Check Vercel environment variables**:
   - Is `NEXT_PUBLIC_API_BASE_URL` set correctly?
   - Does it match your Render backend URL exactly?

2. **Verify backend is running**:
   ```bash
   curl https://your-backend.onrender.com/api/health
   # Should return: {"status":"healthy",...} or {"status":"error",...}
   ```

3. **Check browser console**:
   - Open DevTools → Network tab
   - Send a prompt
   - Check the actual URL being called
   - Should be: `https://your-backend.onrender.com/api/openai`

### ❌ Getting "Demo mode" responses instead of real AI?

- Verify `OPENAI_API_KEY` is set on the **backend** (Render), not frontend
- Check key has credits: https://platform.openai.com/account/usage
- Restart backend service after setting the key

### ❌ Getting CORS errors?

- Set `ALLOWED_ORIGINS` on backend (Render) to your frontend URL
- Make sure it matches exactly (including `https://`)

---

## Environment Variable Cheat Sheet

| Deployment | Where | NEXT_PUBLIC_API_BASE_URL |
|------------|-------|--------------------------|
| Standard   | Vercel | ❌ **Not set** (or empty) |
| Split - Frontend | Vercel | ✅ `https://backend.onrender.com` |
| Split - Backend | Render | ❌ **Not set** (not needed) |

---

## More Information

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [API_ROUTING_FIX.md](./API_ROUTING_FIX.md) - Technical details of the fix
- [README.md](./README.md) - Full project documentation
- [.env.example](./.env.example) - All environment variables

---

## Need Help?

1. Check health endpoint: `https://your-backend.onrender.com/api/health`
2. Review browser console for errors
3. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
4. Open an issue on GitHub with:
   - Deployment type (standard vs split)
   - Error messages from console
   - Environment variables (redact secrets!)
