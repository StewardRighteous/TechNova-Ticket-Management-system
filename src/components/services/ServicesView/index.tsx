import React, { useState } from 'react';
import { useTicketStore } from '../../../store/barrel';
import { ServiceTable } from '../ServiceTable';
import { ServiceDetailHero } from '../ServiceDetailHero';
import { Breadcrumb } from '../../common/barrel';

export const ServicesView: React.FC = () => {
  const { data, updateService, setActiveTab, setSelectedTicketId } = useTicketStore();
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [tableState, setTableState] = useState({ page: 1, pageSize: 10, search: '', departmentFilter: [] as string[], statusFilter: [] as string[] });

  const selectedService = data.services.find((s) => s.id === activeServiceId);

  const handleUpdateService = (updates: Partial<import('../../../types/barrel').ServiceLine>) => { if (activeServiceId) updateService(activeServiceId, updates); };

  return (
    <div className="space-y-4 p-2">
      {selectedService ? (
        <>
          <Breadcrumb section="Services" current={selectedService.name} onBack={() => setActiveServiceId(null)} />
          <ServiceDetailHero
          service={selectedService}
          tickets={data.tickets}
          companies={data.companies}
          onUpdateService={handleUpdateService}
          onOpenTicket={(ticketId) => { setSelectedTicketId(ticketId); setActiveTab('tickets'); }}
          />
        </>
      ) : (
        <ServiceTable
          services={data.services}
          onViewService={(id) => setActiveServiceId(id)}
          initialPage={tableState.page}
          initialPageSize={tableState.pageSize}
          initialSearch={tableState.search}
          initialDepartmentFilter={tableState.departmentFilter}
          initialStatusFilter={tableState.statusFilter}
          onTableStateChange={setTableState}
        />
      )}
    </div>
  );
};
