import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import type { InboundChannel, TicketPriority } from '../../types';
import { ChannelSelector } from './ChannelSelector';

export const CreateTicketModal: React.FC = () => {
  const { data, isCreateModalOpen, setIsCreateModalOpen, addTicket } = useTicketStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState(data.companies[0]?.id || '');
  const [serviceId, setServiceId] = useState(data.services[0]?.id || '');
  const [assignedToId, setAssignedToId] = useState(data.employees[0]?.id || '');
  const [channel, setChannel] = useState<InboundChannel>('whatsapp');
  const [priority, setPriority] = useState<TicketPriority>('P1 Urgent');
  const [initialNote, setInitialNote] = useState('');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const company = data.companies.find((c) => c.id === companyId) || data.companies[0];
    const service = data.services.find((s) => s.id === serviceId) || data.services[0];
    const assignee = data.employees.find((e) => e.id === assignedToId) || data.employees[0];

    addTicket({
      code: '',
      title: title.trim(),
      description: description.trim(),
      companyId: company.id,
      companyName: company.name,
      companyCode: company.code,
      serviceId: service.id,
      serviceName: service.name,
      priority,
      status: 'Open',
      channel,
      channelIdentifier: `${channel.toUpperCase()} Inbound #${Math.floor(1000 + Math.random() * 9000)}`,
      clientContact: `${company.contactName} (${company.contactRole})`,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      assignedToRole: assignee.roleTitle,
      currentStageRole: assignee.role,
      slaDeadline: priority.includes('P1') ? '1h remaining' : '4h remaining',
      slaRisk: 'On Target',
      tags: [service.name.split(' ')[0], priority.split(' ')[0]],
      systemRevision: data.companyInfo.version,
      environment: 'Production Cloud Cluster',
      initialNote: initialNote.trim() || 'Ticket intake processed via omnichannel dispatch.'
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">add_circle</span>
            <h2 className="text-base font-bold text-slate-900">Create New Support Ticket</h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <ChannelSelector channel={channel} setChannel={setChannel} />

          <div>
            <label className="block font-bold text-slate-700 mb-1">Incident Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Webhook delivery failure on payment batch sync"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Service Line</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="P1 Urgent">P1 Urgent (Critical Outage)</option>
                <option value="P2 Normal">P2 Normal (Major Defect)</option>
                <option value="P3 Low">P3 Low (Minor Inquiry)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Engineer</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Problem Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact symptoms, impacted users, and logs..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Triage Note</label>
            <input
              type="text"
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="e.g. Received audio message from client director, escalated to senior support"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
