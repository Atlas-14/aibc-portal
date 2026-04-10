/**
 * Anytime Mailbox API Client
 * Wraps the Anytime Mailbox REST API for white-label mail center operations.
 * All client portal mail actions route through this module.
 */

const ATM_BASE = 'https://api.anytimemailbox.com/v1';
const ATM_KEY = process.env.ANYTIME_MAILBOX_API_KEY!;

async function atmFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ATM_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ATM_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Anytime Mailbox API error ${res.status}: ${err}`);
  }
  return res.json();
}

export const atmClient = {
  // Mail items for a given mailbox
  getMailItems: (mailboxId: string, params?: { page?: number; limit?: number }) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces?${new URLSearchParams(params as Record<string, string> || {})}`),

  // Get single mail item detail
  getMailItem: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}`),

  // Request actions on mail items
  requestScan: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/scan_requests`, { method: 'POST' }),

  requestForward: (mailboxId: string, itemId: string, address: Record<string, string>) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/forward_requests`, {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),

  requestShred: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/shred_requests`, { method: 'POST' }),

  requestRecycle: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/recycle_requests`, { method: 'POST' }),

  requestCheckDeposit: (mailboxId: string, itemId: string, bankInfo: Record<string, string>) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/check_deposit_requests`, {
      method: 'POST',
      body: JSON.stringify(bankInfo),
    }),

  // Get mailbox info
  getMailbox: (mailboxId: string) =>
    atmFetch(`/mailboxes/${mailboxId}`),

  // Get requests history
  getRequests: (mailboxId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/requests`),
};
