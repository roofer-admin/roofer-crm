'use client';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (deal: any) => void;
};

export default function NewDealModal({ open, onClose, onCreated }: Props) {
  const [dealName, setDealName] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const createDeal = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_name: dealName,
          priority,
          contact: {
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            email: email || undefined,
            phone_number: phone || undefined,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create deal');
      onCreated?.(json.deal);
      onClose();
      setDealName('');
      setPriority('medium');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">New Deal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Deal name</label>
            <input
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="e.g., Roof Replacement - Smith Residence"
              className="w-full rounded border border-gray-600 bg-gray-900 p-2 text-sm outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-300">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full rounded border border-gray-600 bg-gray-900 p-2 text-sm outline-none focus:border-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-300">Contact first name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g., John"
                className="w-full rounded border border-gray-600 bg-gray-900 p-2 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-300">Contact last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g., Smith"
                className="w-full rounded border border-gray-600 bg-gray-900 p-2 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-300">Contact email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded border border-gray-600 bg-gray-900 p-2 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-300">Contact phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full rounded border border-gray-600 bg-gray-900 p-2 text-sm outline-none focus:border-purple-500"
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded bg-gray-700 px-3 py-2 text-sm">Cancel</button>
            <button
              onClick={createDeal}
              disabled={submitting || !dealName.trim()}
              className="rounded bg-purple-600 px-3 py-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


