import React, { useState } from 'react';
import type { Ticket, Employee, TicketStatus } from '../../types';
import { TicketBanner } from './TicketBanner';
import { TicketTimeline } from './TicketTimeline';

interface TicketDetailHeroProps {
  ticket: Ticket;
  employees: Employee[];
  onBack: () => void;
  onStatusChange: (status: TicketStatus) => void;
  onAssigneeChange: (empId: string) => void;
  onUpdateTicketFields: (updates: Partial<Ticket>) => void;
}

export const TicketDetailHero: React.FC<TicketDetailHeroProps> = ({
  ticket,
  employees,
  onBack,
  onStatusChange,
  onAssigneeChange,
  onUpdateTicketFields
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDesc, setEditDesc] = useState(ticket.description);
  const [activeTab, setActiveTab] = useState<'timeline' | 'diagnostics'>('timeline');

  const handleSave = () => {
    onUpdateTicketFields({ title: editTitle.trim(), description: editDesc.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(ticket.title);
    setEditDesc(ticket.description);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Ticket Table</span>
      </button>

      <TicketBanner ticket={ticket} />

      {/* Body: Tabs & Editable Grid List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span> Activity & Timeline
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'diagnostics' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span> Diagnostics & Specs
            </button>
          </div>

          {activeTab === 'timeline' ? (
            <TicketTimeline
              timeline={ticket.timeline}
              newNote=""
              setNewNote={() => {}}
              onAddNote={() => {}}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">tune</span>
                  <span>Incident Specifications & Parameters</span>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Headline</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Details</label>
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Cluster Node</span>
                    <span className="font-mono font-bold text-slate-800">{ticket.diagnosticData?.clusterNode || 'k8s-auth-proxy'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Affected Users</span>
                    <span className="font-bold text-red-600 font-mono">{ticket.diagnosticData?.affectedUsers || 140} Users</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Environment</span>
                    <span className="font-mono text-slate-800 font-semibold">{ticket.environment}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Revision</span>
                    <span className="font-mono text-slate-800 font-semibold">{ticket.systemRevision}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispatch Action Center
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State Transition</label>
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-indigo-700"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Pending QA">Pending QA</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Specialist</label>
              <select
                value={ticket.assignedToId}
                onChange={(e) => onAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-800"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
