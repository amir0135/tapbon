import 'server-only';
import { EmailClient } from '@azure/communication-email';

// Azure Communication Services (EU data-lokation) — bruges til
// glemt adgangskode-mails. Fejler blødt hvis env mangler (lokal dev uden ACS).

let client: EmailClient | null = null;

function getClient(): EmailClient | null {
  if (client) return client;
  const conn = process.env.ACS_CONNECTION_STRING;
  if (!conn) return null;
  client = new EmailClient(conn);
  return client;
}

export async function sendEmail({
  to,
  subject,
  plainText,
  html,
}: {
  to: string;
  subject: string;
  plainText: string;
  html: string;
}): Promise<boolean> {
  const emailClient = getClient();
  const sender = process.env.ACS_SENDER_ADDRESS;
  if (!emailClient || !sender) {
    console.warn('[email] ACS ikke konfigureret — mail ikke sendt til', to);
    return false;
  }
  try {
    const poller = await emailClient.beginSend({
      senderAddress: sender,
      content: { subject, plainText, html },
      recipients: { to: [{ address: to }] },
    });
    const result = await poller.pollUntilDone();
    return result.status === 'Succeeded';
  } catch (err) {
    console.error('[email] send fejlede:', err);
    return false;
  }
}
