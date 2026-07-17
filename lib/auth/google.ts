import 'server-only';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Google OAuth 2.0 (authorization code flow) til merchant-login.
// Client-id/secret ligger i env (Key Vault er tenant-policy-låst).

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(): string {
  return `${process.env.BASE_URL ?? ''}/api/auth/google/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${AUTH_ENDPOINT}?${params}`;
}

export type GoogleProfile = {
  email: string;
  emailVerified: boolean;
  name: string | null;
};

/** Byt code til tokens og verificér id_token-signaturen mod Googles JWKS. */
export async function exchangeCodeForProfile(
  code: string
): Promise<GoogleProfile | null> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    console.error('[google] token exchange fejlede:', await res.text());
    return null;
  }
  const { id_token: idToken } = (await res.json()) as { id_token?: string };
  if (!idToken) return null;

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    if (typeof payload.email !== 'string') return null;
    return {
      email: payload.email.toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === 'string' ? payload.name : null,
    };
  } catch (err) {
    console.error('[google] id_token-verifikation fejlede:', err);
    return null;
  }
}
