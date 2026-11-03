import React, { useState } from 'react';
import type { Employee } from '../../types';
import { TablePagination, TableHeaderSection } from '../common';

interface EmployeeTableProps {
  employees: Employee[];
  activeRoleId: string;
  onViewEmployee: (employeeId: string) => void;
}

type SortField = 'name' | 'role' | 'capacity' | 'status';

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  activeRoleId,
  onViewEmployee
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = employees.filter((e) => {
    if (roleFilter !== 'all' && e.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.roleTitle.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'role') cmp = a.roleTitle.localeCompare(b.roleTitle);
    else if (sortField === 'capacity') cmp = (a.activeTicketsCount / a.capacityMax) - (b.activeTicketsCount / b.capacityMax);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <TableHeaderSection
        title="Engineering & Operations Roster"
        subtitle="Operational capacity across Support, Senior Support, Dev, QA, and Account Managers"
        badgeText={`${filtered.length} Roster Members`}
        searchQuery={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
        searchPlaceholder="Filter engineer name or role..."
      >
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="support_agent">Support Agent</option>
          <option value="senior_support">Senior Support</option>
          <option value="development_team">Dev Team</option>
          <option value="qa">QA & Test</option>
          <option value="account_manager">Account Manager</option>
          <option value="operations_manager">Operations Manager</option>
        </select>
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="py-3 px-6 cursor-pointer" onClick={() => handleSort('name')}>
                <span>Staff Member</span>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('role')}>
                <span>Role & Title</span>
              </th>
              <th className="py-3 px-4">Direct Email</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('capacity')}>
                <span>Capacity Gauge</span>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('status')}>
                <span>Status</span>
              </th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((emp) => {
              const capacityPct = Math.round((emp.activeTicketsCount / emp.capacityMax) * 100);
              const isCurrent = emp.role === activeRoleId;

              return (
                <tr key={emp.id} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        <span className="material-symbols-outlined text-[17px]">{emp.avatar}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{emp.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{emp.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {emp.roleTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                    {emp.email}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">{emp.activeTicketsCount} / {emp.capacityMax}</span>
                      <span className="font-bold text-slate-800 font-mono">{capacityPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${capacityPct > 80 ? 'bg-red-500' : capacityPct > 60 ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                        style={{ width: `${capacityPct}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      emp.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={() => onViewEmployee(emp.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <span>View</span>
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePagination
        totalItems={filtered.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
};
