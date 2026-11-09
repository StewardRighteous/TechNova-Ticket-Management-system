import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { ServiceTable } from './ServiceTable';
import { ServiceDetailHero } from './ServiceDetailHero';
import { Breadcrumb } from '../common';

export const ServicesView: React.FC = () => {
  const { data, updateService } = useTicketStore();
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  const selectedService = data.services.find((s) => s.id === activeServiceId);

  const handleUpdateService = (updates: Partial<import('../../types').ServiceLine>) => { if (activeServiceId) updateService(activeServiceId, updates); };

  return (
    <div className="space-y-4 p-2">
      {selectedService ? (
        <>
          <Breadcrumb section="Services" current={selectedService.name} onBack={() => setActiveServiceId(null)} />
          <ServiceDetailHero
          service={selectedService}
          onBack={() => setActiveServiceId(null)}
          onUpdateService={handleUpdateService}
          />
        </>
      ) : (
        <ServiceTable
          services={data.services}
          onViewService={(id) => setActiveServiceId(id)}
        />
      )}
    </div>
  );
};
