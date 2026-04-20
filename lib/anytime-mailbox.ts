/**
 * Anytime Mailbox API Client
 * Wraps the Anytime Mailbox REST API for white-label mail center operations.
 */

const ATM_BASE = 'https://connect.anytimemailbox.com/v1';
const ATM_KEY = process.env.ANYTIME_MAILBOX_API_KEY!;
export const ATM_PENDING_SETUP_VALUE = 'PENDING_SETUP';

export type CreateMailboxInput = {
  email: string;
  fullName: string;
  businessName?: string | null;
  planTier?: string | null;
};

export function getAnytimeMailboxOperatorId() {
  const operatorId = process.env.ANYTIME_MAILBOX_OPERATOR_ID?.trim();
  if (!operatorId || operatorId === ATM_PENDING_SETUP_VALUE) {
    return null;
  }
  return operatorId;
}

function appendFormValue(params: URLSearchParams, key: string, value: unknown) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    for (const item of value) appendFormValue(params, `${key}[]`, item);
    return;
  }

  if (typeof value === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      appendFormValue(params, `${key}[${nestedKey}]`, nestedValue);
    }
    return;
  }

  params.append(key, String(value));
}

function toFormBody(formData?: Record<string, unknown>) {
  if (!formData) return undefined;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(formData)) {
    appendFormValue(params, key, value);
  }
  return params.toString();
}

async function atmFetch(path: string, method = 'GET', formData?: Record<string, unknown>) {
  if (!ATM_KEY) {
    throw new Error('ANYTIME_MAILBOX_API_KEY is not configured');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${ATM_KEY}`,
    'Accept': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (formData && method !== 'GET') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.body = toFormBody(formData);
  }

  const res = await fetch(`${ATM_BASE}${path}`, options);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok || (data && typeof data === 'object' && 'success' in data && (data as { success?: boolean }).success === false)) {
    throw new Error(`Anytime Mailbox error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function createMailboxForClient(input: CreateMailboxInput) {
  const nameParts = (input.fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Client';
  const lastName = nameParts.slice(1).join(' ') || 'Client';

  const renterData = await atmFetch('/renters', 'POST', {
    first_name: firstName,
    last_name: lastName,
    email: input.email,
    country: 'US',
    ...(input.businessName ? { company: input.businessName } : {}),
    notify: 'false',
  });

  const renterId =
    (typeof renterData === 'object' && renterData !== null
      ? (renterData as { data?: { id?: number | string }; id?: number | string }).data?.id ??
        (renterData as { data?: { renter_id?: number | string }; renter_id?: number | string }).data?.renter_id ??
        (renterData as { id?: number | string }).id ??
        (renterData as { renter_id?: number | string }).renter_id
      : null);

  if (!renterId) {
    throw new Error('No renter_id returned from Anytime Mailbox');
  }

  const mailboxList = await atmFetch('/mailboxes?status=available&limit=1');
  const mailboxes =
    (typeof mailboxList === 'object' && mailboxList !== null
      ? (mailboxList as { data?: { mailboxes?: Array<Record<string, unknown>> }; mailboxes?: Array<Record<string, unknown>> }).data?.mailboxes ??
        (mailboxList as { mailboxes?: Array<Record<string, unknown>> }).mailboxes ??
        []
      : []);

  let path = '/renters';

  if (mailboxes.length > 0) {
    const mailboxName = String(mailboxes[0]?.name || mailboxes[0]?.mailbox_name || '').trim();

    if (mailboxName) {
      try {
        await atmFetch(`/mailboxes/${encodeURIComponent(mailboxName)}/assign`, 'POST', {
          renter_id: String(renterId),
        });
        path = `/mailboxes/${encodeURIComponent(mailboxName)}/assign`;
      } catch (error) {
        console.error('Mailbox assignment failed:', error);
      }
    }
  }

  return {
    mailboxId: String(renterId),
    mailbox_id: String(renterId),
    renterId: Number(renterId),
    renter_id: Number(renterId),
    path,
  };
}

export const atmClient = {
  getMailItems: (mailboxId: string, params?: { page?: number; limit?: number }) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces?${new URLSearchParams(
      Object.entries(params || {}).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined && value !== null) acc[key] = String(value);
        return acc;
      }, {})
    ).toString()}`),

  getMailItem: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}`),

  requestScan: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/scan_requests`, 'POST'),

  requestForward: (mailboxId: string, itemId: string, address: Record<string, string>) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/forward_requests`, 'POST', address),

  requestShred: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/shred_requests`, 'POST'),

  requestRecycle: (mailboxId: string, itemId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/recycle_requests`, 'POST'),

  requestCheckDeposit: (mailboxId: string, itemId: string, bankInfo: Record<string, string>) =>
    atmFetch(`/mailboxes/${mailboxId}/mail_pieces/${itemId}/check_deposit_requests`, 'POST', bankInfo),

  getMailbox: (mailboxId: string) =>
    atmFetch(`/mailboxes/${mailboxId}`),

  getRequests: (mailboxId: string) =>
    atmFetch(`/mailboxes/${mailboxId}/requests`),
};
