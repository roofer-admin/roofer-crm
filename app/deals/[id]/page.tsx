import { notFound } from 'next/navigation';
import ClientView from './ClientView';
import { createClient } from '@supabase/supabase-js';

type Props = { params: { id: string } };

async function fetchDealWithContact(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: d, error } = await supabase
    .from('deals')
    .select('id, deal_name, priority, created_at, updated_at, contact_id')
    .eq('id', id)
    .single();
  if (error || !d) return null;

  let contact: { first_name?: string | null; last_name?: string | null; email?: string | null; phone_number?: string | null } | null = null;
  if (d.contact_id) {
    const { data: c } = await supabase
      .from('contacts')
      .select('first_name, last_name, email, phone_number')
      .eq('id', d.contact_id)
      .single();
    contact = c ?? null;
  }

  const person = contact ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') : undefined;

  return {
    id: d.id as string,
    title: (d.deal_name as string) ?? 'Deal',
    person,
    org: undefined,
    stage: 'new-digital-lead',
    value: 0,
    priority: ((d.priority as string) ?? 'medium') as 'low' | 'medium' | 'high',
    createdAt: (d.created_at as string) ?? new Date().toISOString(),
    updatedAt: (d.updated_at as string) ?? (d.created_at as string),
    address: undefined,
    phone: (contact?.phone_number as string) || undefined,
    email: (contact?.email as string) || undefined,
    notes: [],
    history: [],
  } as const;
}

export default async function DealPage({ params }: Props) {
  const deal = await fetchDealWithContact(params.id);
  if (!deal) return notFound();
  return <ClientView deal={deal} />;
}


