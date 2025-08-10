import { notFound } from 'next/navigation';
import ClientView from './ClientView';

type Props = { params: Promise<{ id: string }> };

async function fetchDeal(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/deals/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.ok) return null;
  // Map minimal DB deal to client model
  const d = json.deal as { id: string; deal_name: string; priority: string; created_at: string; updated_at?: string };
  return {
    id: d.id,
    title: d.deal_name,
    person: undefined,
    org: undefined,
    stage: 'new-digital-lead',
    value: 0,
    priority: (d.priority ?? 'medium') as 'low' | 'medium' | 'high',
    createdAt: d.created_at,
    updatedAt: d.updated_at ?? d.created_at,
    address: undefined,
    phone: undefined,
    email: undefined,
    notes: [],
    history: [],
  } as const;
}

export default async function DealPage(props: Props) {
  const { id } = await props.params;
  const deal = await fetchDeal(id);
  if (!deal) return notFound();
  return <ClientView deal={deal} />;
}


