import React, { useState } from 'react';
import type { Employee } from '../../types';

interface EmployeeDetailHeroProps {
  employee: Employee;
  onBack: () => void;
  onUpdateEmployee: (updates: Partial<Employee>) => void;
}

export const EmployeeDetailHero: React.FC<EmployeeDetailHeroProps> = ({
  employee,
  onBack,
  onUpdateEmployee
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone);
  const [capacityMax, setCapacityMax] = useState(employee.capacityMax);

  const handleSave = () => {
    onUpdateEmployee({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      capacityMax: Number(capacityMax)
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone);
    setCapacityMax(employee.capacityMax);
    setIsEditing(false);
  };

  const capacityPct = Math.round((employee.activeTicketsCount / employee.capacityMax) * 100);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Roster Table</span>
      </button>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow">
              <span className="material-symbols-outlined text-[24px]">{employee.avatar}</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{employee.name}</h1>
              <span className="text-xs text-indigo-400 font-semibold">{employee.roleTitle}</span>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
            {employee.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Incidents</span>
            <span className="text-lg font-bold text-white font-mono">{employee.activeTicketsCount}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Maximum Capacity</span>
            <span className="text-lg font-bold text-indigo-300 font-mono">{employee.capacityMax}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Workload Band</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{capacityPct}% Active</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Direct Phone</span>
            <span className="text-sm font-mono text-white">{employee.phone}</span>
          </div>
        </div>
      </div>

      {/* Grid List Detail Card with Edit Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">badge</span>
            <span>Specialist Profile & System Responsibilities</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Direct Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Ticket Capacity</label>
              <input
                type="number"
                value={capacityMax}
                onChange={(e) => setCapacityMax(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Internal Dispatch Role</span>
              <span className="font-bold text-slate-800">{employee.roleTitle}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Ingress</span>
              <span className="font-mono text-slate-800">{employee.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl col-span-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Technical Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                    {s}
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
