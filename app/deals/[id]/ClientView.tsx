'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type DealClientModel = {
  id: string;
  title: string;
  person?: string;
  org?: string;
  stage: string;
  value: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string[];
  history?: { date: string; text: string }[];
};

type Props = {
  deal: DealClientModel;
};

const pipelineStages: { id: string; name: string }[] = [
  { id: 'lead-to-consult', name: 'Lead to Consult' },
  { id: 'consultation-scheduled', name: 'Consultation Scheduled' },
  { id: 'consultation-attended', name: 'Consultation Attended' },
  { id: 'report-ready', name: 'Report Ready' },
  { id: 'proposal', name: 'Proposal' },
  { id: 'won', name: 'Won' },
  { id: 'lost', name: 'Lost' },
];

export default function ClientView({ deal }: Props) {
  const [activeTab, setActiveTab] = useState<'notes' | 'activity' | 'emails' | 'files' | 'documents' | 'invoice'>('notes');

  const currentStageIndex = useMemo(() => {
    const idx = pipelineStages.findIndex((s) => s.id === deal.stage);
    return idx === -1 ? 0 : idx;
  }, [deal.stage]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/deals" className="text-gray-300 hover:text-white">Deals</Link>
            <span className="text-gray-500">/</span>
            <span className="font-semibold">{deal.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300">rotting for 89 days</span>
            <button className="text-xs px-2 py-1 rounded bg-green-700">Won</button>
            <button className="text-xs px-2 py-1 rounded bg-red-700">Lost</button>
          </div>
        </div>

        {/* Stage progress bar */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-7 gap-1">
            {pipelineStages.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center">
                <div className="text-[10px] text-gray-400 mb-1">{i === 2 ? '174 days' : i === 0 ? '6 days' : '0 days'}</div>
                <div className={`h-2 w-full rounded ${i <= currentStageIndex ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            {pipelineStages.map((s) => (
              <span key={s.id} className="truncate">{s.name}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-6">
        {/* Left sidebar sections */}
        <aside className="col-span-3 space-y-4">
          <Section title="Please fill">
            <ul className="space-y-2 text-sm text-gray-200">
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" /> Claim Filed — <span className="text-gray-400">Verified</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" /> Confirmed
              </li>
            </ul>
          </Section>

          <Section title="Summary">
            <div className="space-y-2 text-sm text-gray-200">
              {deal.address && <InfoRow icon="location">{deal.address}</InfoRow>}
              {deal.person && <InfoRow icon="user">{deal.person}</InfoRow>}
              <InfoRow icon="tag">Stage: {deal.stage}</InfoRow>
            </div>
          </Section>

          <Section title="Person">
            <div className="space-y-1 text-sm text-gray-200">
              <div>{deal.person ?? '—'}</div>
              <div className="text-gray-400">{deal.email ?? '—'}</div>
              <div className="text-gray-400">{deal.phone ?? '—'}</div>
            </div>
          </Section>

          <Section title="Details">
            <div className="text-xs text-gray-400">Data Tracking (Pipeline)</div>
          </Section>

          <Section title="System Links">
            <ul className="text-xs text-gray-400 space-y-1">
              <li>Spotio: 6797b50...</li>
              <li>Reports: https://admin.roofer.com/report/...</li>
            </ul>
          </Section>
        </aside>

        {/* Center: notes & history */}
        <section className="col-span-6 space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded">
            <div className="px-4 pt-3 border-b border-gray-700">
              <div className="flex items-center gap-4 text-sm">
                {(
                  [
                    { key: 'notes', label: 'Notes' },
                    { key: 'activity', label: 'Activity' },
                    { key: 'emails', label: 'Emails' },
                    { key: 'files', label: 'Files' },
                    { key: 'documents', label: 'Documents' },
                    { key: 'invoice', label: 'Invoice' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    className={`py-2 ${activeTab === t.key ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {/* Composer */}
              <div className="bg-gray-700 rounded p-3 text-sm text-gray-200 mb-4" contentEditable suppressContentEditableWarning>
                Take a note, @name...
              </div>

              <h3 className="text-xs text-gray-400 mb-2">History</h3>
              <div className="space-y-2 text-sm">
                {deal.history?.map((h, i) => (
                  <div key={i} className="p-2 rounded bg-gray-800 border border-gray-700">
                    <div className="text-xs text-gray-500">{new Date(h.date).toLocaleString()}</div>
                    <div>{h.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="col-span-3 space-y-4">
          <Section title="Booking Times">
            <div className="text-sm text-gray-200 space-y-1">
              <div>Consultation: <span className="text-gray-400">January 28, 2025</span></div>
              <div>Time: <span className="text-gray-400">3:30 PM</span></div>
            </div>
          </Section>

          <Section title="System">
            <div className="text-xs text-gray-400 space-y-1">
              <div>Created: {new Date(deal.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(deal.updatedAt).toLocaleString()}</div>
              <div>Priority: {deal.priority}</div>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-4">
      <div className="text-sm text-gray-300 mb-2">{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ icon, children }: { icon: 'location' | 'user' | 'tag'; children: React.ReactNode }) {
  const path = icon === 'location'
    ? 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z'
    : icon === 'user'
    ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    : 'M7 7h10M7 12h4M7 17h7';
  return (
    <div className="flex items-start gap-2">
      <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
      </svg>
      <div>{children}</div>
    </div>
  );
}


