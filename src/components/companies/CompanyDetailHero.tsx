import React, { useState } from "react";
import type { Company } from "../../types";
import { ChannelBadge } from "../common";

interface CompanyDetailHeroProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updates: Partial<Company>) => void;
}

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onBack,
  onUpdateCompany,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [contactName, setContactName] = useState(company.contactName);
  const [contactEmail, setContactEmail] = useState(company.contactEmail);
  const [contactPhone, setContactPhone] = useState(company.contactPhone);
  const [slaTime, setSlaTime] = useState(company.slaResponseTime);

  const handleSave = () => {
    onUpdateCompany({
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      slaResponseTime: slaTime.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContactName(company.contactName);
    setContactEmail(company.contactEmail);
    setContactPhone(company.contactPhone);
    setSlaTime(company.slaResponseTime);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow">
              {company.code}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{company.name}</h1>
              <span className="text-xs font-semibold text-indigo-400">
                {company.tier}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              {company.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              SLA Guarantee
            </span>
            <span className="font-mono text-lg font-bold text-amber-400">
              {company.slaResponseTime}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Active Incidents
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {company.activeTickets}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Active Contracts
            </span>
            <span className="font-mono text-lg font-bold text-indigo-300">
              {company.activeContracts}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Account Lead
            </span>
            <span className="text-sm font-bold text-white">
              {company.accountManager}
            </span>
          </div>
        </div>
      </div>

      {/* Grid List Details Card with Edit functionality */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              contact_mail
            </span>
            <span>Primary Client Contact & SLA Parameters</span>
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
                Executive Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Phone Number
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                SLA Response Window
              </label>
              <input
                type="text"
                value={slaTime}
                onChange={(e) => setSlaTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Executive Contact
              </span>
              <span className="font-bold text-slate-800">
                {company.contactName} ({company.contactRole})
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Official Communications
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-slate-800">
                  {company.contactEmail}
                </span>
                <ChannelBadge channel={company.preferredChannel} />
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Phone Line
              </span>
              <span className="font-mono text-slate-800">
                {company.contactPhone}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Subscribed Services
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {company.subscribedServices.map((s, idx) => (
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
