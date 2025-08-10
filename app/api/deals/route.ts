import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type MinimalDealRow = {
  id: string;
  deal_name: string;
  priority: 'low' | 'medium' | 'high' | null;
  created_at?: string;
  contact_id?: string | null;
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env (URL or SERVICE ROLE)');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// List deals (map minimal DB schema to Kanban fields expected by UI)
export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from<MinimalDealRow>('deals')
      .select('id, deal_name, priority, created_at, contact_id')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const deals = (data ?? []).map((d) => ({
      id: d.id,
      title: d.deal_name,
      description: null,
      customer_name: null,
      priority: d.priority,
      project_type: null,
      estimated_hours: null,
      actual_hours: null,
      assignee: null,
      due_date: null,
      status: 'new-digital-lead',
      value: 0,
      days_overdue: null,
      has_warning: null,
      order_index: null,
      created_at: d.created_at,
      updated_at: d.created_at,
    }));

    return NextResponse.json({ ok: true, deals });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

// Create a new deal (supports {deal_name, priority} or {title, priority})
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const dealName = (body.deal_name ?? body.title ?? '').trim();
    const priority = (body.priority ?? 'medium') as 'low' | 'medium' | 'high';
    if (!dealName) return NextResponse.json({ error: 'deal_name is required' }, { status: 400 });

    const supabase = getServiceClient();

    // Determine owner_id
    let ownerId = body.owner_id as string | undefined;
    if (!ownerId) {
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1);
      if (usersErr) throw usersErr;
      ownerId = users?.[0]?.id;
    }
    if (!ownerId) return NextResponse.json({ error: 'No owner found. Pass owner_id or create a user.' }, { status: 400 });

    // Optionally create a contact if provided
    let contactId: string | undefined;
    if (body.contact) {
      const { first_name, last_name, email, phone_number } = body.contact as { first_name?: string; last_name?: string; email?: string; phone_number?: string };
      const { data: contact, error: cErr } = await supabase
        .from('contacts')
        .insert({ owner_id: ownerId, first_name, last_name, email, phone_number })
        .select('id')
        .single();
      if (cErr) throw cErr;
      contactId = contact?.id;
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({ owner_id: ownerId, deal_name: dealName, priority, contact_id: contactId })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, deal: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}


