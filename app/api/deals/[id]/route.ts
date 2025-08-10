import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { id } = params;

    // Only update columns that actually exist on deals
    const update: Record<string, any> = {};
    if (typeof body.deal_name === 'string') update.deal_name = body.deal_name;
    if (typeof body.title === 'string') update.deal_name = body.title;
    if (typeof body.priority === 'string') update.priority = body.priority;
    if (typeof body.owner_id === 'string') update.owner_id = body.owner_id;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { data, error } = await svc()
      .from('deals')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, deal: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await svc().from('deals').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await svc().from('deals').select('*').eq('id', params.id).single();
    if (error) throw error;
    return NextResponse.json({ ok: true, deal: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}

