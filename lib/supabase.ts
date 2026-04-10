import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ClientPlan = 'essentials' | 'plus' | 'pro';

export type PortalClient = {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  plan: ClientPlan;
  mailbox_id: string | null;
  credit_addon: boolean;
  unit_owner: boolean;
  unit_number: string | null;
  created_at: string;
};

// Plan metadata
export const PLANS: Record<ClientPlan, { name: string; price: number; features: string[] }> = {
  essentials: {
    name: 'Business Essentials',
    price: 59,
    features: ['30 mail items/mo', '5 scan requests', '25 pages/mo', '2 forward requests', 'Unlimited recycling'],
  },
  plus: {
    name: 'Business Plus',
    price: 99,
    features: ['75 mail items/mo', '20 scan requests', '100 pages/mo', '6 forward requests', '2 check deposits/mo', 'Unlimited shred & recycle'],
  },
  pro: {
    name: 'Business Pro',
    price: 149,
    features: ['Unlimited mail', 'Unlimited scan', 'Unlimited pages', '15 forward requests', '5 check deposits/mo', 'Unlimited shred & recycle'],
  },
};
