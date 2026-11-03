import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { ServiceTable } from './ServiceTable';
import { ServiceDetailHero } from './ServiceDetailHero';
import type { ServiceLine } from '../../types';

export const ServicesView: React.FC = () => {
  const { data } = useTicketStore();
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  const selectedService = data.services.find((s) => s.id === activeServiceId);

  const handleUpdateService = (updates: Partial<ServiceLine>) => {
    if (!activeServiceId) return;
    const updated = data.services.map((s) => {
      if (s.id === activeServiceId) {
        return { ...s, ...updates };
      }
      return s;
    });
    useTicketStore.setState({
      data: { ...data, services: updated }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {selectedService ? (
        <ServiceDetailHero
          service={selectedService}
          onBack={() => setActiveServiceId(null)}
          onUpdateService={handleUpdateService}
        />
      ) : (
        <ServiceTable
          services={data.services}
          onViewService={(id) => setActiveServiceId(id)}
        />
      )}
    </div>
  );
};
