'use client';

import { useState } from 'react';
import { Task, Column } from './KanbanBoard';

interface KanbanColumnProps {
  column: Column;
  onMoveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
  onAddTask: (columnId: string, task: Omit<Task, 'id' | 'status'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
  allColumns: Column[];
}

export function KanbanColumn({
  column,
  onMoveTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  allColumns
}: KanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'status'>>({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    projectType: 'repair' as 'repair' | 'replacement' | 'maintenance' | 'inspection',
    customerName: '',
    estimatedHours: 0,
    value: 0
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromColumnId = e.dataTransfer.getData('fromColumnId');

    if (taskId && fromColumnId !== column.id) {
      onMoveTask(taskId, fromColumnId, column.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddTask = () => {
    if (newTask.title.trim() && newTask.customerName.trim()) {
      onAddTask(column.id, newTask);
                   setNewTask({
               title: '',
               description: '',
               priority: 'medium' as 'low' | 'medium' | 'high',
               projectType: 'repair' as 'repair' | 'replacement' | 'maintenance' | 'inspection',
               customerName: '',
               estimatedHours: 0,
               value: 0
             });
      setIsAddingTask(false);
    }
  };

  const getColumnHeaderColor = (columnId: string) => {
    switch (columnId) {
      case 'new-digital-lead': return 'bg-purple-700';
      case 'consultation-scheduled': return 'bg-purple-700';
      case 'report-ready': return 'bg-purple-700';
      case 'rescheduled-by-ae': return 'bg-purple-700';
      case 'needs-to-be-rescheduled': return 'bg-purple-700';
      case 'rescheduled-by-sdr': return 'bg-purple-700';
      case 'power-close': return 'bg-purple-700';
      case 'consultation-attended': return 'bg-purple-700';
      default: return 'bg-purple-700';
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Column Header */}
      <div className={`${getColumnHeaderColor(column.id)} rounded-t-lg p-4 mb-4`}>
                    <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-purple-100 text-sm mb-1">{column.title}</h3>
                <div className="flex items-center space-x-2 text-xs text-purple-200">
                  <span>${column.totalValue}</span>
                  <span>{column.tasks.length} deal{column.tasks.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
      </div>

      {/* Column Content */}
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1 min-h-[400px]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Task List */}
        <div className="space-y-3">
          {column.tasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id);
                e.dataTransfer.setData('fromColumnId', column.id);
              }}
              className={`p-3 rounded-lg shadow-sm border cursor-move ${
                task.daysOverdue && task.daysOverdue > 0 
                  ? 'bg-red-900 border-red-700' 
                  : column.id === 'consultation-attended'
                  ? 'bg-gray-700 border-purple-500'
                  : 'bg-gray-700 border-purple-500'
              }`}
              onClick={() => (window.location.href = `/deals/${task.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white text-sm leading-tight">{task.title}</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => onUpdateTask(task.id, { ...task })}
                    className="text-gray-400 hover:text-white p-1"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id, column.id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-xs mb-3">{task.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-400">{task.customerName}</span>
                </div>

                {task.daysOverdue && task.daysOverdue > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-red-400 font-medium">{task.daysOverdue}d</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">${task.value}</span>
                  {task.hasWarning && (
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Form */}
        {isAddingTask ? (
          <div className="mt-4 p-4 bg-purple-800 rounded-lg border border-purple-600">
            <input
              type="text"
              placeholder="Deal title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full mb-3 p-2 border border-purple-600 rounded text-sm bg-gray-800 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full mb-3 p-2 border border-purple-600 rounded text-sm bg-gray-800 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={2}
            />
            <input
              type="text"
              placeholder="Customer name"
              value={newTask.customerName}
              onChange={(e) => setNewTask({ ...newTask, customerName: e.target.value })}
              className="w-full mb-3 p-2 border border-purple-600 rounded text-sm bg-gray-800 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <div className="flex gap-2 mb-3">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="flex-1 p-2 border border-purple-600 rounded text-sm bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                value={newTask.projectType}
                onChange={(e) => setNewTask({ ...newTask, projectType: e.target.value as 'repair' | 'replacement' | 'maintenance' | 'inspection' })}
                className="flex-1 p-2 border border-purple-600 rounded text-sm bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="repair">Repair</option>
                <option value="replacement">Replacement</option>
                <option value="maintenance">Maintenance</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="Estimated hours"
              value={newTask.estimatedHours}
              onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
              className="w-full mb-3 p-2 border border-purple-600 rounded text-sm bg-gray-800 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add Deal
              </button>
              <button
                onClick={() => setIsAddingTask(false)}
                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full mt-4 p-3 border-2 border-dashed border-purple-500 rounded-lg text-purple-300 hover:border-purple-400 hover:text-purple-200 transition-colors bg-gray-800 hover:bg-purple-700"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
