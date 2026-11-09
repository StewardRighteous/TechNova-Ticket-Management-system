import React, { useState } from "react";
import type { Employee } from "../../types";

interface EmployeeDetailHeroProps {
  employee: Employee;
  onBack: () => void;
  onUpdateEmployee: (updates: Partial<Employee>) => void;
}

export const EmployeeDetailHero: React.FC<EmployeeDetailHeroProps> = ({
  employee,
  onBack,
  onUpdateEmployee,
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
      capacityMax: Number(capacityMax),
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

  const capacityPct = Math.round(
    (employee.activeTicketsCount / employee.capacityMax) * 100,
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow">
              <span className="material-symbols-outlined text-[24px]">
                {employee.avatar}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{employee.name}</h1>
              <span className="text-xs font-semibold text-indigo-400">
                {employee.roleTitle}
              </span>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            {employee.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Active Incidents
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {employee.activeTicketsCount}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Maximum Capacity
            </span>
            <span className="font-mono text-lg font-bold text-indigo-300">
              {employee.capacityMax}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Workload Band
            </span>
            <span className="font-mono text-lg font-bold text-amber-400">
              {capacityPct}% Active
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Direct Phone
            </span>
            <span className="font-mono text-sm text-white">
              {employee.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Grid List Detail Card with Edit Mode */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              badge
            </span>
            <span>Specialist Profile & System Responsibilities</span>
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
          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Full Name
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Direct Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Max Ticket Capacity
              </label>
              <input
                type="number"
                value={capacityMax}
                onChange={(e) => setCapacityMax(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Internal Dispatch Role
              </span>
              <span className="font-bold text-slate-800">
                {employee.roleTitle}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Email Ingress
              </span>
              <span className="font-mono text-slate-800">{employee.email}</span>
            </div>
            <div className="col-span-2 rounded-xl bg-slate-50 p-3">
              <span className="mb-1 block text-[10px] font-bold text-slate-400 uppercase">
                Technical Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                  >
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
