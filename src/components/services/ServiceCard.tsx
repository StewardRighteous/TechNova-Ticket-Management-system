import { Heading } from "../../ui/barrel";
import React from 'react';
import type { ServiceLine } from "../../types/barrel";

interface ServiceCardProps {
  service: ServiceLine;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 block mb-0.5">
              {service.code}
            </span>
            <Heading as="h3" variant="subsection">{service.name}</Heading>
            <span className="text-[11px] text-slate-500 font-medium">{service.department}</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {service.status}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-600 leading-relaxed">
          {service.description}
        </p>

        {/* Technologies Stack */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Supported Stack & Frameworks
          </span>
          <div className="flex flex-wrap gap-1.5">
            {service.technologies.map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SLA & Leadership Metrics */}
      <div className="mt-6 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block">SLA Target</span>
          <span className="font-bold text-indigo-700 font-mono">{service.slaTarget}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block">Uptime</span>
          <span className="font-bold text-emerald-600 font-mono">{service.uptime}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block">Active Tickets</span>
          <span className="font-bold text-slate-800 font-mono">{service.activeTickets}</span>
        </div>
      </div>
    </div>
  );
};
