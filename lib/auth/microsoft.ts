import 'server-only';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { OAuthProfile } from './oauth-login';

// Microsoft Entra ID OAuth 2.0 (authorization code flow) — "common"-endpointet
// dækker både personlige Microsoft-konti (MSA) og arbejds-/skolekonti.
// App-registrering: signInAudience = AzureADandPersonalMicrosoftAccount,
// redirect-URI {BASE_URL}/api/auth/microsoft/callback, optional claims
// email + xms_edov på id_token.

const AUTH_ENDPOINT =
  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_ENDPOINT =
  'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const JWKS = createRemoteJWKSet(
  new URL('https://login.microsoftonline.com/common/discovery/v2.0/keys')
);

// Consumer-tenanten (personlige Microsoft-konti) — e-mails her er verificerede.
const MSA_TENANT = '9188040d-6c67-4c5b-b112-36a304b66dad';

export function microsoftConfigured(): boolean {
  return Boolean(
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
  );
}

export function redirectUri(): string {
  return `${process.env.BASE_URL ?? ''}/api/auth/microsoft/callback`;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${AUTH_ENDPOINT}?${params}`;
}

/** Byt code til tokens og verificér id_token mod Microsofts JWKS. */
export async function exchangeCodeForProfile(
  code: string
): Promise<OAuthProfile | null> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    console.error('[microsoft] token exchange fejlede:', await res.text());
    return null;
  }
  const { id_token: idToken } = (await res.json()) as { id_token?: string };
  if (!idToken) return null;

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: process.env.MICROSOFT_CLIENT_ID!,
      // issuer varierer pr. tenant på common-endpointet — valideres manuelt nedenfor
    });
    const tid = typeof payload.tid === 'string' ? payload.tid : null;
    if (
      !tid ||
      payload.iss !== `https://login.microsoftonline.com/${tid}/v2.0`
    ) {
      return null;
    }
    if (typeof payload.email !== 'string') return null;

    // E-mail-verifikation: MSA-konti er altid verificerede; for organisations-
    // konti kræves xms_edov (Email Domain Owner Verified — optional claim),
    // ellers kan en fremmed tenant-admin sætte vilkårlig e-mail (kontokapring).
    const emailVerified = tid === MSA_TENANT || payload.xms_edov === true;

    return {
      email: payload.email.toLowerCase(),
      emailVerified,
      name: typeof payload.name === 'string' ? payload.name : null,
    };
  } catch (err) {
    console.error('[microsoft] id_token-verifikation fejlede:', err);
    return null;
  }
}
