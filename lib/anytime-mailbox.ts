/**
 * Anytime Mailbox API Client
 * Wraps the Anytime Mailbox REST API for white-label mail center operations.
 */

const ATM_BASE = 'https://connect.anytimemailbox.com/v1';
const ATM_KEY = process.env.ANYTIME_MAILBOX_API_KEY!;
export const ATM_PENDING_SETUP_VALUE = 'PENDING_SETUP';

const SERVICE_PLAN_MAP: Record<string, number> = {
  essentials: 31970,
  plus: 31971,
  pro: 31972,
};

export type CreateMailboxInput = {
  email: string;
  fullName: string;
  businessName?: string | null;
  planTier?: string | null;
};

export type ForwardAddressInput = {
  fullName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  shippingMethod?: string;
};

export function getAnytimeMailboxOperatorId() {
  const operatorId = process.env.ANYTIME_MAILBOX_OPERATOR_ID?.trim();
  if (!operatorId || operatorId === ATM_PENDING_SETUP_VALUE) {
    return null;
  }
  return operatorId;
}

function appendFormValue(params: URLSearchParams, key: string, value: unknown) {
  if (value === null || value === undefined || value === '') return;

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

export async function atmFetch(path: string, method = 'GET', formData?: Record<string, unknown>) {
  if (!ATM_KEY) {
    throw new Error('ANYTIME_MAILBOX_API_KEY is not configured');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${ATM_KEY}`,
    Accept: 'application/json',
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

async function atmFetchFirst(
  candidates: string[],
  method = 'GET',
  formData?: Record<string, unknown>
) {
  let lastError: Error | null = null;

  for (const path of candidates) {
    try {
      return await atmFetch(path, method, formData);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error('Anytime Mailbox request failed');
}

function extractList<T = Record<string, unknown>>(data: unknown, collectionKeys: string[]) {
  if (!data || typeof data !== 'object') return [] as T[];

  const root = data as Record<string, unknown>;
  const nested = typeof root.data === 'object' && root.data !== null ? (root.data as Record<string, unknown>) : null;

  for (const key of collectionKeys) {
    const direct = root[key];
    if (Array.isArray(direct)) return direct as T[];

    const fromNested = nested?.[key];
    if (Array.isArray(fromNested)) return fromNested as T[];
  }

  return [] as T[];
}

function extractRecord(data: unknown) {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  if (typeof root.data === 'object' && root.data !== null) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

async function resolveMailboxName(renterId: string) {
  const mailboxes = await getRenterMailboxes(renterId);
  const primary = mailboxes[0];
  const mailboxName = String(primary?.name || primary?.mailbox_name || '').trim();

  if (!mailboxName) {
    throw new Error(`No mailbox assigned for renter ${renterId}`);
  }

  return mailboxName;
}

function buildMailCollectionCandidates(renterId: string, mailboxName: string, params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';

  return [
    `/mailboxes/${encodeURIComponent(mailboxName)}/mail_pieces${suffix}`,
    `/mailboxes/${encodeURIComponent(mailboxName)}/mail${suffix}`,
    `/renters/${renterId}/mailboxes/${encodeURIComponent(mailboxName)}/mail_pieces${suffix}`,
    `/renters/${renterId}/mailboxes/${encodeURIComponent(mailboxName)}/mail${suffix}`,
  ];
}

function buildMailActionCandidates(
  renterId: string,
  mailboxName: string,
  mailPieceId: string,
  actionPaths: string[]
) {
  const encodedMailbox = encodeURIComponent(mailboxName);
  const encodedPiece = encodeURIComponent(mailPieceId);

  return actionPaths.flatMap((actionPath) => [
    `/mailboxes/${encodedMailbox}/mail_pieces/${encodedPiece}/${actionPath}`,
    `/mailboxes/${encodedMailbox}/mail/${encodedPiece}/${actionPath}`,
    `/renters/${renterId}/mailboxes/${encodedMailbox}/mail_pieces/${encodedPiece}/${actionPath}`,
    `/renters/${renterId}/mailboxes/${encodedMailbox}/mail/${encodedPiece}/${actionPath}`,
  ]);
}

function normalizeForwardPayload(address: ForwardAddressInput) {
  return {
    recipient_name: address.fullName,
    company: address.company,
    address_1: address.address1,
    address_2: address.address2,
    city: address.city,
    state: address.state,
    zip: address.postalCode,
    country: address.country || 'US',
    shipping_method: address.shippingMethod,
  };
}

export async function createMailboxForClient(input: CreateMailboxInput) {
  const nameParts = (input.fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Client';
  const lastName = nameParts.slice(1).join(' ') || 'Client';
  const normalizedPlanTier = input.planTier?.trim().toLowerCase() || 'essentials';
  const servicePlanId = SERVICE_PLAN_MAP[normalizedPlanTier];

  if (!servicePlanId) {
    throw new Error(`Unsupported Anytime Mailbox plan tier: ${input.planTier}`);
  }

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
  const mailboxes = extractList<Record<string, unknown>>(mailboxList, ['mailboxes']);

  const mailboxName = String(mailboxes[0]?.name || mailboxes[0]?.mailbox_name || '').trim();

  if (!mailboxName) {
    throw new Error('No available Anytime Mailbox mailbox found');
  }

  await atmFetch('/mailboxes/assign', 'POST', {
    renter_id: String(renterId),
    mailbox_name: mailboxName,
    service_plan_id: String(servicePlanId),
    billing_cycle: 'monthly',
  });

  return {
    mailboxId: String(renterId),
    mailbox_id: String(renterId),
    renterId: Number(renterId),
    renter_id: Number(renterId),
    path: '/mailboxes/assign',
  };
}

export async function deactivateRenter(renterId: string) {
  return atmFetch(`/renters/${renterId}/deactivate`, 'POST');
}

export async function getRenterMailboxes(renterId: string) {
  const data = await atmFetch(`/renters/${renterId}/mailboxes`);
  return extractList<Record<string, unknown>>(data, ['mailboxes']);
}

export async function unassignMailbox(mailboxName: string) {
  return atmFetch('/mailboxes/unassign', 'POST', {
    mailbox_name: mailboxName,
  });
}

export async function getMailItems(renterId: string, params?: { page?: number; limit?: number }) {
  const mailboxName = await resolveMailboxName(renterId);
  const data = await atmFetchFirst(buildMailCollectionCandidates(renterId, mailboxName, params));
  return extractList<Record<string, unknown>>(data, ['mail_pieces', 'mailPieces', 'items', 'mail']);
}

export async function getMailItem(renterId: string, mailPieceId: string) {
  const mailboxName = await resolveMailboxName(renterId);
  const data = await atmFetchFirst(
    [
      `/mailboxes/${encodeURIComponent(mailboxName)}/mail_pieces/${encodeURIComponent(mailPieceId)}`,
      `/mailboxes/${encodeURIComponent(mailboxName)}/mail/${encodeURIComponent(mailPieceId)}`,
      `/renters/${renterId}/mailboxes/${encodeURIComponent(mailboxName)}/mail_pieces/${encodeURIComponent(mailPieceId)}`,
      `/renters/${renterId}/mailboxes/${encodeURIComponent(mailboxName)}/mail/${encodeURIComponent(mailPieceId)}`,
    ]
  );

  return extractRecord(data);
}

export async function requestScan(renterId: string, mailPieceId: string) {
  const mailboxName = await resolveMailboxName(renterId);
  return atmFetchFirst(
    buildMailActionCandidates(renterId, mailboxName, mailPieceId, ['scan_requests', 'scan']) ,
    'POST'
  );
}

export async function requestForward(renterId: string, mailPieceId: string, forwardAddress: ForwardAddressInput) {
  const mailboxName = await resolveMailboxName(renterId);
  return atmFetchFirst(
    buildMailActionCandidates(renterId, mailboxName, mailPieceId, ['forward_requests', 'forward']),
    'POST',
    normalizeForwardPayload(forwardAddress)
  );
}

export async function requestShred(renterId: string, mailPieceId: string) {
  const mailboxName = await resolveMailboxName(renterId);
  return atmFetchFirst(
    buildMailActionCandidates(renterId, mailboxName, mailPieceId, ['shred_requests', 'shred']),
    'POST'
  );
}

export async function requestOpen(renterId: string, mailPieceId: string) {
  const mailboxName = await resolveMailboxName(renterId);
  return atmFetchFirst(
    buildMailActionCandidates(renterId, mailboxName, mailPieceId, ['open_requests', 'open', 'scan_requests']),
    'POST'
  );
}

export const atmClient = {
  getMailItems,
  getMailItem,
  requestScan,
  requestForward,
  requestShred,
  requestOpen,
  getMailbox: async (renterId: string) => {
    const mailboxName = await resolveMailboxName(renterId);
    return atmFetch(`/mailboxes/${encodeURIComponent(mailboxName)}`);
  },
  getRequests: async (renterId: string) => {
    const mailboxName = await resolveMailboxName(renterId);
    return atmFetch(`/mailboxes/${encodeURIComponent(mailboxName)}/requests`);
  },
};
