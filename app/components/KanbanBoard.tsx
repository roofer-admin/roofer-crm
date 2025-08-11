'use client';

import { useEffect, useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import NewDealModal from './NewDealModal';

export interface Task {
  id: string;
  title: string;
  description: string;
  customerName: string;
  priority: 'low' | 'medium' | 'high';
  projectType: 'repair' | 'replacement' | 'maintenance' | 'inspection';
  estimatedHours: number;
  actualHours?: number;
  assignee?: string;
  dueDate?: string;
  status: string;
  value: number;
  daysOverdue?: number;
  hasWarning?: boolean;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  totalValue: number;
}

export default function KanbanBoard() {
  const [showNewDeal, setShowNewDeal] = useState(false);
  const initialColumns: Column[] = [
    {
      id: 'new-digital-lead',
      title: 'New Digital Lead',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'consultation-scheduled',
      title: 'Consultation Scheduled',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'report-ready',
      title: 'Report Ready',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'rescheduled-by-ae',
      title: 'Rescheduled By AE',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'needs-to-be-rescheduled',
      title: 'Needs To Be Rescheduled',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'rescheduled-by-sdr',
      title: 'Rescheduled By SDR',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'power-close',
      title: 'Power Close',
      tasks: [],
      totalValue: 0
    },
    {
      id: 'consultation-attended',
      title: 'Consultation Attended',
      tasks: [],
      totalValue: 0
    }
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [, setIsLoading] = useState<boolean>(false);

  function recomputeTotals(nextColumns: Column[]): Column[] {
    return nextColumns.map((col) => ({
      ...col,
      totalValue: col.tasks.reduce((sum, t) => sum + (t.value ?? 0), 0),
    }));
  }

  type DealApiRow = {
    id: string;
    title?: string | null;
    description?: string | null;
    customer_name?: string | null;
    priority?: Task['priority'] | null;
    project_type?: Task['projectType'] | null;
    estimated_hours?: number | null;
    actual_hours?: number | null;
    assignee?: string | null;
    due_date?: string | null;
    status?: string | null;
    value?: number | null;
    days_overdue?: number | null;
    has_warning?: boolean | null;
  };

  function mapRowToTask(row: DealApiRow): Task {
    return {
      id: row.id,
      title: row.title ?? '',
      description: row.description ?? '',
      customerName: row.customer_name ?? '',
      priority: (row.priority ?? 'medium') as Task['priority'],
      projectType: (row.project_type ?? 'repair') as Task['projectType'],
      estimatedHours: Number(row.estimated_hours ?? 0),
      actualHours: row.actual_hours ?? undefined,
      assignee: row.assignee ?? undefined,
      dueDate: row.due_date ?? undefined,
      status: row.status ?? 'new-digital-lead',
      value: Number(row.value ?? 0),
      daysOverdue: row.days_overdue ?? undefined,
      hasWarning: Boolean(row.has_warning ?? false),
    };
  }

  useEffect(() => {
    let isActive = true;
    async function loadDeals() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/deals', { cache: 'no-store' });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Failed to load deals');
        const tasks: Task[] = (json.deals as DealApiRow[]).map(mapRowToTask);
        const byStatus = tasks.reduce<Record<string, Task[]>>((acc, t) => {
          acc[t.status] = acc[t.status] ? [...acc[t.status], t] : [t];
          return acc;
        }, {});
        if (!isActive) return;
        setColumns((prev) => {
          const next = prev.map((c) => ({ ...c, tasks: byStatus[c.id] ?? [] }));
          return recomputeTotals(next);
        });
      } catch {
        // keep initial mock-empty columns if API fails
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadDeals();
    return () => {
      isActive = false;
    };
  }, []);

  const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    setColumns(prevColumns => {
      const fromColumn = prevColumns.find(col => col.id === fromColumnId);
      const toColumn = prevColumns.find(col => col.id === toColumnId);
      
      if (!fromColumn || !toColumn) return prevColumns;
      
      const task = fromColumn.tasks.find(t => t.id === taskId);
      if (!task) return prevColumns;
      
      const updatedTask = { ...task, status: toColumnId };
      const next = prevColumns.map(col => {
        if (col.id === fromColumnId) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
        if (col.id === toColumnId) {
          return { ...col, tasks: [...col.tasks, updatedTask] };
        }
        return col;
      });
      return recomputeTotals(next);
    });
    // Persist
    fetch(`/api/deals/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: toColumnId }),
    }).catch(() => {});
  };

  const addTask = (columnId: string, task: Omit<Task, 'id' | 'status'>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = { ...task, id: tempId, status: columnId };
    setColumns(prev => {
      const next = prev.map(col => col.id === columnId ? { ...col, tasks: [...col.tasks, optimisticTask] } : col);
      return recomputeTotals(next);
    });
    // Persist
    fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        customerName: task.customerName,
        priority: task.priority,
        projectType: task.projectType,
        estimatedHours: task.estimatedHours,
        value: task.value,
        status: columnId,
      }),
    })
      .then(res => res.json())
      .then(json => {
        if (!json?.ok) return;
        const created = json.deal;
        setColumns(prev => {
          const next = prev.map(col => col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.map(t => (t.id === tempId ? {
                  ...t,
                  id: created.id,
                } : t)),
              }
            : col,
          );
          return recomputeTotals(next);
        });
      })
      .catch(() => {});
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setColumns(prevColumns => {
      const next = prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task),
      }));
      return recomputeTotals(next);
    });
    // Persist
    const payload: Partial<Task> = { ...updates };
    if ('customerName' in payload) payload.customerName = updates.customerName;
    if ('projectType' in payload) payload.projectType = updates.projectType;
    if ('estimatedHours' in payload) payload.estimatedHours = updates.estimatedHours;
    if ('actualHours' in payload) payload.actualHours = updates.actualHours;
    if ('dueDate' in payload) payload.dueDate = updates.dueDate;
    fetch(`/api/deals/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(prevColumns => {
      const next = prevColumns.map(col =>
        col.id === columnId ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) } : col,
      );
      return recomputeTotals(next);
    });
    // Persist
    fetch(`/api/deals/${taskId}`, { method: 'DELETE' }).catch(() => {});
  };

  const totalDeals = columns.reduce((acc, col) => acc + col.tasks.length, 0);

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-slate-900/60 border-b border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
        <div className="w-full flex items-center justify-between px-6 py-3">
          {/* Left Side */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-fuchsia-500 to-indigo-500 rounded-md shadow-lg shadow-fuchsia-500/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">r</span>
            </div>
            <span className="text-slate-200 font-medium tracking-tight">Deals</span>
            <button className="text-gray-400 hover:text-purple-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Middle - Search Bar */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search roofer.com"
                className="bg-white/5 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 border border-white/10"
                onChange={async (e) => {
                  const q = e.target.value.trim();
                  if (!q) {
                    setColumns((prev) => prev); // no-op
                    return;
                  }
                  try {
                    const res = await fetch(`/api/deals/search?q=${encodeURIComponent(q)}`);
                    const json = await res.json();
                    if (!json.ok) return;
                    const tasks: Task[] = (json.deals as { id: string; deal_name: string; priority?: Task['priority'] | null }[]).map((d) => ({
                      id: d.id,
                      title: d.deal_name,
                      description: '',
                      customerName: '',
                      priority: (d.priority ?? 'medium') as Task['priority'],
                      projectType: 'repair',
                      estimatedHours: 0,
                      status: 'new-digital-lead',
                      value: 0,
                    }));
                    setColumns((prev) => {
                      const next = prev.map((c) => ({ ...c, tasks: c.id === 'new-digital-lead' ? tasks : [] }));
                      return recomputeTotals(next);
                    });
                  } catch (_) {}
                }}
              />
            </div>
            <button onClick={() => setShowNewDeal(true)} className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10" title="Add deal">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">JG</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-16 bg-gray-800 min-h-screen border-r border-gray-700">
          <div className="py-6 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">r</span>
              </div>
            </div>

            {/* Navigation Icons */}
            <nav className="space-y-4">
              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-purple-300 hover:bg-purple-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full bg-purple-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">17</span>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">269</span>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>

              <button className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-900">
          {/* Control Bar */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-purple-200">{totalDeals} deals</span>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded text-white bg-gradient-to-br from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 ring-1 ring-white/10 shadow-md shadow-fuchsia-600/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded text-gray-300 hover:bg-purple-600">
                  <span>Lead to Consult</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded text-white ring-1 ring-white/10 shadow-md shadow-fuchsia-600/20">
                  <span>John Giraldo</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded text-gray-300 hover:bg-purple-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>Sort by: Next activity</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-purple-300 text-sm">Pin filters</span>
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>

          {/* Kanban Board (fixed width, no horizontal scroll) */}
          <div className="p-6">
            <div className="w-full">
              <div className="grid grid-cols-8 gap-4 w-full">
                {columns.map(column => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    onMoveTask={moveTask}
                    onAddTask={addTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    allColumns={columns}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <NewDealModal
        open={showNewDeal}
        onClose={() => setShowNewDeal(false)}
        onCreated={(deal) => {
          const newTask: Task = {
            id: deal.id,
            title: deal.deal_name ?? deal.title ?? 'New Deal',
            description: '',
            customerName: '',
            priority: (deal.priority ?? 'medium') as Task['priority'],
            projectType: 'repair',
            estimatedHours: 0,
            status: 'new-digital-lead',
            value: 0,
          };
          setColumns(prev => {
            const next = prev.map(col => col.id === 'new-digital-lead' ? { ...col, tasks: [...col.tasks, newTask] } : col);
            return recomputeTotals(next);
          });
        }}
      />
    </div>
  );
}
