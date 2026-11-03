import React, { useState } from 'react';
import type { Company } from '../../types';
import { ChannelBadge } from '../common';

interface CompanyDetailHeroProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updates: Partial<Company>) => void;
}

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onBack,
  onUpdateCompany
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
      slaResponseTime: slaTime.trim()
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
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Companies Table</span>
      </button>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow">
              {company.code}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{company.name}</h1>
              <span className="text-xs text-indigo-400 font-semibold">{company.tier}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              {company.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">SLA Guarantee</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{company.slaResponseTime}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Incidents</span>
            <span className="text-lg font-bold text-white font-mono">{company.activeTickets}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Contracts</span>
            <span className="text-lg font-bold text-indigo-300 font-mono">{company.activeContracts}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Lead</span>
            <span className="text-sm font-bold text-white">{company.accountManager}</span>
          </div>
        </div>
      </div>

      {/* Grid List Details Card with Edit functionality */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">contact_mail</span>
            <span>Primary Client Contact & SLA Parameters</span>
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
              <label className="block font-bold text-slate-700 mb-1">Executive Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">SLA Response Window</label>
              <input
                type="text"
                value={slaTime}
                onChange={(e) => setSlaTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Executive Contact</span>
              <span className="font-bold text-slate-800">{company.contactName} ({company.contactRole})</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Communications</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-slate-800">{company.contactEmail}</span>
                <ChannelBadge channel={company.preferredChannel} />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Line</span>
              <span className="font-mono text-slate-800">{company.contactPhone}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Subscribed Services</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {company.subscribedServices.map((s, idx) => (
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
