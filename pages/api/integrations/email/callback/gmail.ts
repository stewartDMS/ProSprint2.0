import type { NextApiRequest, NextApiResponse } from 'next';
import { store as storeToken } from '../../../../../lib/tokenStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const code = req.query.code as string;
  if (!code) {
    res.writeHead(302, { Location: `/integrations?error=gmail&message=Missing+authorization+code` });
    res.end();
    return;
  }

  // Exchange code for tokens
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      code,
    }),
  });

  if (!tokenResp.ok) {
    res.writeHead(302, { Location: `/integrations?error=gmail&message=Token+exchange+failed` });
    res.end();
    return;
  }

  const data = await tokenResp.json();

  // Minimal key logging
  console.log('[Gmail Callback] TOKEN_ENCRYPTION_KEY:', !!process.env.TOKEN_ENCRYPTION_KEY, process.env.TOKEN_ENCRYPTION_KEY?.length);
  console.log('[Gmail Callback] ENCRYPTION_KEY:', !!process.env.ENCRYPTION_KEY, process.env.ENCRYPTION_KEY?.length);

  if (!process.env.TOKEN_ENCRYPTION_KEY || !process.env.ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_KEY.length !== 64 || process.env.ENCRYPTION_KEY.length !== 64) {
    res.writeHead(302, { Location: `/integrations?error=gmail&message=Encryption+key+env+var+missing+or+invalid` });
    res.end();
    return;
  }

  await storeToken('gmail', 'default', {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    scope: data.scope,
    token_type: data.token_type,
  });

  res.writeHead(302, { Location: '/integrations?connected=gmail' });
  res.end();
}
