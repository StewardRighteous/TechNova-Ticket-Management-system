import React, { useState } from 'react';
import type { ServiceLine } from '../../types';

interface ServiceDetailHeroProps {
  service: ServiceLine;
  onBack: () => void;
  onUpdateService: (updates: Partial<ServiceLine>) => void;
}

export const ServiceDetailHero: React.FC<ServiceDetailHeroProps> = ({
  service,
  onBack,
  onUpdateService
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(service.name);
  const [lead, setLead] = useState(service.lead);
  const [description, setDescription] = useState(service.description);
  const [slaTarget, setSlaTarget] = useState(service.slaTarget);

  const handleSave = () => {
    onUpdateService({
      name: name.trim(),
      lead: lead.trim(),
      description: description.trim(),
      slaTarget: slaTarget.trim()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(service.name);
    setLead(service.lead);
    setDescription(service.description);
    setSlaTarget(service.slaTarget);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Services Table</span>
      </button>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="font-mono text-xs text-indigo-400 font-bold block mb-1">
              {service.code}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold">{service.name}</h1>
            <span className="text-xs text-slate-400 font-medium">{service.department}</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
            {service.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">SLA Guarantee</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{service.slaTarget}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Uptime Record</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{service.uptime}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Incidents</span>
            <span className="text-lg font-bold text-white font-mono">{service.activeTickets}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department Lead</span>
            <span className="text-sm font-bold text-white">{service.lead}</span>
          </div>
        </div>
      </div>

      {/* Grid List Details Card with Edit Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">layers</span>
            <span>Service Scope & Framework Specifications</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Lead</label>
                <input
                  type="text"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {service.description}
            </p>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">
                Supported Technologies & Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {service.technologies.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
