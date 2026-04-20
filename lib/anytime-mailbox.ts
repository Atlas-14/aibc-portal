/**
 * Anytime Mailbox API Client
 * Wraps the Anytime Mailbox REST API for white-label mail center operations.
 * All client portal mail actions route through this module.
 */

const ATM_BASE = 'https://api.anytimemailbox.com/v1';
const ATM_KEY = process.env.ANYTIME_MAILBOX_API_KEY!;
export const ATM_PENDING_SETUP_VALUE = 'PENDING_SETUP';

export type CreateMailboxInput = {
  email: string;
  fullName: string;
  businessName?: string | null;
  planTier?: string | null;
};

/**
 * The Anytime Mailbox operator ID identifies the white-label operator account
 * that owns and manages AIBC mailboxes. Mail endpoints should block until this
 * is configured, because mailbox records are scoped under that operator setup.
 */
export function getAnytimeMailboxOperatorId() {
  const operatorId = process.env.ANYTIME_MAILBOX_OPERATOR_ID?.trim();
  if (!operatorId || operatorId === ATM_PENDING_SETUP_VALUE) {
    return null;
  }
  return operatorId;
}

async function atmFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ATM_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ATM_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const responseBody = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => res.statusText);

  if (!res.ok) {
    const err = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
    throw new Error(`Anytime Mailbox API error ${res.status}: ${err}`);
  }

  return responseBody;
}

function normalizeName(fullName: string) {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || trimmed,
    lastName: parts.slice(1).join(' ') || 'Client',
  };
}

function createMailboxPayload(input: CreateMailboxInput, operatorId: string) {
  const { firstName, lastName } = normalizeName(input.fullName);
  const company = input.businessName?.trim() || undefined;
  const tier = input.planTier?.trim() || undefined;

  return {
    operator_id: operatorId,
    operatorId,
    email: input.email,
    plan: tier,
    plan_tier: tier,
    tier,
    customer: {
      email: input.email,
      first_name: firstName,
      last_name: lastName,
      full_name: input.fullName,
      company,
      business_name: company,
    },
    mailbox: {
      operator_id: operatorId,
      email: input.email,
      first_name: firstName,
      last_name: lastName,
      full_name: input.fullName,
      company,
      business_name: company,
      plan: tier,
      plan_tier: tier,
    },
    first_name: firstName,
    last_name: lastName,
    full_name: input.fullName,
    company,
    business_name: company,
  };
}

function extractMailboxId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const directCandidates = [
    record.mailbox_id,
    record.mailboxId,
    record.id,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (typeof candidate === 'number') return String(candidate);
  }

  const nestedCandidates = [record.mailbox, record.customer, record.data, record.result];
  for (const nested of nestedCandidates) {
    const nestedId = extractMailboxId(nested);
    if (nestedId) return nestedId;
  }

  if (Array.isArray(record.items)) {
    for (const item of record.items) {
      const nestedId = extractMailboxId(item);
      if (nestedId) return nestedId;
    }
  }

  return null;
}

async function tryCreateMailbox(path: string, payload: Record<string, unknown>) {
  const response = await atmFetch(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const mailboxId = extractMailboxId(response);
  if (!mailboxId) {
    throw new Error(`Anytime Mailbox create mailbox response did not include a mailbox id: ${JSON.stringify(response)}`);
  }

  return {
    mailboxId,
    response,
    path,
  };
}

export async function createMailboxForClient(input: CreateMailboxInput) {
  if (!ATM_KEY) {
    throw new Error('ANYTIME_MAILBOX_API_KEY is not configured');
  }

  const operatorId = getAnytimeMailboxOperatorId();
  if (!operatorId) {
    throw new Error('ANYTIME_MAILBOX_OPERATOR_ID is not configured');
  }

  const payload = createMailboxPayload(input, operatorId);
  const attempts = [
    { path: `/operators/${operatorId}/mailboxes`, payload: payload.mailbox as Record<string, unknown> },
    { path: '/mailboxes', payload },
    { path: `/operators/${operatorId}/customers`, payload: payload.customer as Record<string, unknown> },
    { path: '/customers', payload: payload.customer as Record<string, unknown> },
  ];

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      return await tryCreateMailbox(attempt.path, attempt.payload);
    } catch (error) {
      errors.push(`${attempt.path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Unable to create Anytime Mailbox mailbox. Attempts: ${errors.join(' | ')}`);
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
