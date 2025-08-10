export type DealDetail = {
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

export const mockDeals: DealDetail[] = [
  {
    id: '1',
    title: 'Harold Nesbitt - Roofing',
    person: 'Harold Nesbitt',
    stage: 'consultation-scheduled',
    value: 0,
    priority: 'high',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-02-10T10:00:00Z',
    address: '815 Davenport St, Charlotte, NC 28208, USA',
    phone: '+1 (980) 288-4039',
    email: 'harold@example.com',
    notes: ['Claim filed - verified', 'Confirmed'],
    history: [
      { date: '2025-04-10T12:00:00Z', text: 'Stage: Rescheduled by AE → Report Ready' },
      { date: '2025-03-21T09:00:00Z', text: 'Stage: Needs To Be Rescheduled → Rescheduled By SDR' },
    ],
  },
  {
    id: '2',
    title: 'Shawn Willard - Roofing (Google SEO Lead)',
    person: 'Shawn Willard',
    stage: 'report-ready',
    value: 0,
    priority: 'high',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-04-20T10:00:00Z',
    address: 'Charlotte, NC',
    phone: '+1 (980) 000-0000',
    email: 'shawn@example.com',
    notes: ['Booking info synced from Google'],
    history: [
      { date: '2025-04-12T12:00:00Z', text: 'Stage: Report Ready' },
    ],
  },
  {
    id: '3',
    title: 'Dustin Harris - Repair',
    person: 'Dustin Harris',
    stage: 'consultation-attended',
    value: 0,
    priority: 'medium',
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-12T10:00:00Z',
  },
  {
    id: '4',
    title: 'Chris Turner - Commercial Roofing',
    person: 'Chris Turner',
    org: 'Olympus Construction',
    stage: 'consultation-attended',
    value: 0,
    priority: 'high',
    createdAt: '2025-02-02T10:00:00Z',
    updatedAt: '2025-02-12T10:00:00Z',
  },
  {
    id: '5',
    title: 'Chirag Kumar Sirohi',
    person: 'Chirag Kumar Sirohi',
    stage: 'consultation-attended',
    value: 0,
    priority: 'medium',
    createdAt: '2025-02-03T10:00:00Z',
    updatedAt: '2025-02-13T10:00:00Z',
  },
];


