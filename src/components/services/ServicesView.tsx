import React from 'react';
import { useTicketStore } from '../../store';
import { ServiceCard } from './ServiceCard';

export const ServicesView: React.FC = () => {
  const { data, searchQuery } = useTicketStore();

  const filteredServices = data.services.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Services & Operational Departments</h1>
          <p className="text-xs text-slate-500">
            TechNova Core Offerings: Custom Web Apps, Cloud Infra, ERP, 24/7 Support, & IT Consulting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            {filteredServices.length} Active SLA Service Lines
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <ServiceCard key={srv.id} service={srv} />
        ))}
      </div>
    </div>
  );
};
