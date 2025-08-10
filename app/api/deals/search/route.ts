import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ ok: true, deals: [] });
    const supabase = svc();
    const { data, error } = await supabase
      .from('deals')
      .select('id, deal_name, priority, created_at')
      .ilike('deal_name', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ ok: true, deals: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}


