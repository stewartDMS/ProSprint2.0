import type { NextApiRequest, NextApiResponse } from 'next';
import { store as storeToken } from '../../../../../lib/tokenStorage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const code = req.query.code as string;
  if (!code) {
    res.writeHead(302, { Location: `/integrations?error=outlook&message=Missing+authorization+code` });
    res.end();
    return;
  }

  // Exchange code for tokens
  const tokenResp = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID!,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI!,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResp.ok) {
    res.writeHead(302, { Location: `/integrations?error=outlook&message=Token+exchange+failed` });
    res.end();
    return;
  }

  const data = await tokenResp.json();

  // Minimal key logging
  console.log('[Outlook Callback] TOKEN_ENCRYPTION_KEY:', !!process.env.TOKEN_ENCRYPTION_KEY, process.env.TOKEN_ENCRYPTION_KEY?.length);
  console.log('[Outlook Callback] ENCRYPTION_KEY:', !!process.env.ENCRYPTION_KEY, process.env.ENCRYPTION_KEY?.length);

  if (!process.env.TOKEN_ENCRYPTION_KEY || !process.env.ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_KEY.length !== 64 || process.env.ENCRYPTION_KEY.length !== 64) {
    res.writeHead(302, { Location: `/integrations?error=outlook&message=Encryption+key+env+var+missing+or+invalid` });
    res.end();
    return;
  }

  await storeToken('outlook', 'default', {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    scope: data.scope,
    token_type: data.token_type,
  });

  res.writeHead(302, { Location: '/integrations?connected=outlook' });
  res.end();
}
