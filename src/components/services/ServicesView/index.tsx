import { Button, Heading } from "../../../ui/barrel";
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTicketStore } from "../../../store/barrel";
import { ServiceTable } from "../ServiceTable";
import { ServiceDetailHero } from "../ServiceDetailHero";
import { canAccessService, filterTicketsByRole, ROLE_PERMISSIONS } from "../../../utils/rolePermissions";

export const ServicesView: React.FC = () => {
  const { data, activeRole, currentUser, updateService, deleteService } = useTicketStore();
  const navigate = useNavigate();
  const { serviceId: activeServiceId } = useParams<{ serviceId: string }>();
  const [tableState, setTableState] = useState({ page: 1, pageSize: 10, search: '', departmentFilter: [] as string[], statusFilter: [] as string[] });

  const canManageTeam = ROLE_PERMISSIONS[activeRole].canManageTeam;
  const visibleServices = currentUser ? data.services.filter((service) => canAccessService(service, currentUser)) : [];
  const selectedService = visibleServices.find((service) => service.id === activeServiceId);
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);
  const openTickets = roleTickets.filter((ticket) => ticket.status !== "Resolved" && ticket.status !== "Closed");

  const handleUpdateService = (updates: Partial<import('../../../types/barrel').ServiceLine>) => { if (activeServiceId) updateService(activeServiceId, updates); };
  const handleDeleteService = () => {
    if (!activeServiceId) return;
    deleteService(activeServiceId);
    navigate("/services");
  };

  return (
    <div className="space-y-4 p-2">
      {activeServiceId && !selectedService ? (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <Heading as="h1" variant="notice">Service unavailable</Heading>
          <p className="mt-2 text-sm text-slate-700">This service may not exist or may not be available to your role.</p>
          <Button tone="plain" type="button" onClick={() => navigate('/services')} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to services</Button>
        </section>
      ) : <>
        {selectedService && <>
          <ServiceDetailHero
          key={selectedService.id}
          service={selectedService}
          canEdit
          tickets={roleTickets}
          companies={canManageTeam ? data.companies : data.companies.map((company) => ({
            ...company,
            activeTickets: openTickets.filter((ticket) => ticket.companyId === company.id).length,
          }))}
          services={data.services}
          departments={data.departments}
          employees={data.employees}
          teams={data.teams}
          onUpdateService={handleUpdateService}
          onDeleteService={canManageTeam ? handleDeleteService : undefined}
          onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
          />
        </>}
        <div hidden={Boolean(activeServiceId)}><ServiceTable
          services={visibleServices.map((service) => ({ ...service, activeTickets: openTickets.filter((ticket) => ticket.serviceId === service.id).length }))}
          employees={data.employees}
          onViewService={(id) => navigate(`/services/${encodeURIComponent(id)}`)}
          onCreateNew={canManageTeam ? () => navigate("/services/new") : undefined}
          personal={!canManageTeam}
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
