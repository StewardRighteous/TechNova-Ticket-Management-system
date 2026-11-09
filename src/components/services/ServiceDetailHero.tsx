import React, { useState } from "react";
import type { ServiceLine } from "../../types";

interface ServiceDetailHeroProps {
  service: ServiceLine;
  onBack: () => void;
  onUpdateService: (updates: Partial<ServiceLine>) => void;
}

export const ServiceDetailHero: React.FC<ServiceDetailHeroProps> = ({
  service,
  onBack,
  onUpdateService,
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
      slaTarget: slaTarget.trim(),
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
      {/* Hero Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
          <div>
            <span className="mb-1 block font-mono text-xs font-bold text-indigo-400">
              {service.code}
            </span>
            <h1 className="text-xl font-bold sm:text-2xl">{service.name}</h1>
            <span className="text-xs font-medium text-slate-400">
              {service.department}
            </span>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            {service.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              SLA Guarantee
            </span>
            <span className="font-mono text-lg font-bold text-amber-400">
              {service.slaTarget}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Uptime Record
            </span>
            <span className="font-mono text-lg font-bold text-emerald-400">
              {service.uptime}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Active Incidents
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {service.activeTickets}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Department Lead
            </span>
            <span className="text-sm font-bold text-white">{service.lead}</span>
          </div>
        </div>
      </div>

      {/* Grid List Details Card with Edit Mode */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              layers
            </span>
            <span>Service Scope & Framework Specifications</span>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[14px]">
                edit
              </span>{" "}
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Service Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Operational Lead
                </label>
                <input
                  type="text"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 leading-relaxed text-slate-600">
              {service.description}
            </p>
            <div>
              <span className="mb-1.5 block text-[10px] font-bold text-slate-400 uppercase">
                Supported Technologies & Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {service.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                  >
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
