import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicketStore } from '../../../store/barrel';
import { ServiceTable } from '../ServiceTable';
import { ServiceDetailHero } from '../ServiceDetailHero';
import { filterTicketsByRole } from '../../../utils/rolePermissions';

export const ServicesView: React.FC = () => {
  const { data, activeRole, currentUser, updateService } = useTicketStore();
  const navigate = useNavigate();
  const { serviceId: activeServiceId } = useParams<{ serviceId: string }>();
  const [tableState, setTableState] = useState({ page: 1, pageSize: 10, search: '', departmentFilter: [] as string[], statusFilter: [] as string[] });

  const selectedService = data.services.find((s) => s.id === activeServiceId);
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);

  const handleUpdateService = (updates: Partial<import('../../../types/barrel').ServiceLine>) => { if (activeServiceId) updateService(activeServiceId, updates); };

  return (
    <div className="space-y-4 p-2">
      {activeServiceId && !selectedService ? (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-slate-900">Service unavailable</h1>
          <p className="mt-2 text-sm text-slate-700">This service may not exist or may not be available to your role.</p>
          <button type="button" onClick={() => navigate('/services')} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to services</button>
        </section>
      ) : <>
        {selectedService && <>
          <ServiceDetailHero
          service={selectedService}
          canEdit={activeRole === "operations_manager" || activeRole === "management"}
          tickets={roleTickets}
          companies={data.companies}
          onUpdateService={handleUpdateService}
          onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
          />
        </>}
        <div hidden={Boolean(activeServiceId)}><ServiceTable
          services={data.services}
          onViewService={(id) => navigate(`/services/${encodeURIComponent(id)}`)}
          onCreateNew={activeRole === "operations_manager" || activeRole === "management" ? () => navigate("/services/new") : undefined}
          initialPage={tableState.page}
          initialPageSize={tableState.pageSize}
          initialSearch={tableState.search}
          initialDepartmentFilter={tableState.departmentFilter}
          initialStatusFilter={tableState.statusFilter}
          onTableStateChange={setTableState}
        /></div>
      </>}
    </div>
  );
};
