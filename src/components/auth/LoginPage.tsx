import React, { useState } from 'react';
import { useTicketStore } from '../../store/barrel';
import { DemoPersonaGrid } from './DemoPersonaGrid';
import initialData from '../../../mockup.json';

const initialDemoEmployeeIds = new Set(initialData.employees.map((employee) => employee.id));

export const LoginPage: React.FC = () => {
  const { data, login, loginAsEmployee } = useTicketStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (!success) {
      setError('No sample account matches that email. Choose a demo persona above or enter a registered sample email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-7 sm:p-10 relative overflow-hidden">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-3 ring-4 ring-slate-100">
            <span aria-hidden="true" className="material-symbols-outlined text-[32px]">confirmation_number</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            TechNova Solutions
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Choose a sample role to explore the ticket workspace
          </p>
        </div>

        <DemoPersonaGrid
          employees={data.employees.filter((employee) => initialDemoEmployeeIds.has(employee.id))}
          roles={data.roles}
          onSelectPersona={(empId) => loginAsEmployee(empId)}
        />

        <form onSubmit={handleFormSubmit} className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Continue with a registered email</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">This demo checks the email against sample accounts. No password or real sign-in is used.</p>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="demo-email" className="block font-bold text-slate-700 mb-1">Work email</label>
            <div className="relative">
              <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                mail
              </span>
              <input
                id="demo-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@technova.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Continue with email</span>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  );
};
