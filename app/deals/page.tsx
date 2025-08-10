import Link from 'next/link';
import { mockDeals } from './mock-data';

export default function DealsListPage() {
  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Deals</h1>
      <div className="space-y-2">
        {mockDeals.map((d) => (
          <Link key={d.id} href={`/deals/${d.id}`} className="block p-3 rounded border border-gray-700 bg-gray-800 hover:bg-gray-700">
            <div className="flex items-center justify-between">
              <span>{d.title}</span>
              <span className="text-sm text-gray-400">Stage: {d.stage}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


