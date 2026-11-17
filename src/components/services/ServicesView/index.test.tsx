import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Company, ServiceLine, Ticket } from "../../../types/barrel";
import { ServiceDetailHero } from "../ServiceDetailHero";
import { ServiceTable } from "../ServiceTable";

const service: ServiceLine = { id: "svc-1", code: "SVC-1", name: "Cloud Operations", department: "Infrastructure", lead: "Ava Lead", activeTickets: 2, slaTarget: "4h", uptime: "99.9%", description: "Cloud support", technologies: ["AWS", "Kubernetes"], status: "Active" };
const ticket: Ticket = { id: "t-1", code: "TCK-1", title: "Cluster alert", description: "", companyId: "c-1", companyName: "Acme", companyCode: "AC", serviceId: "svc-1", serviceName: service.name, priority: "P2 Normal", status: "Open", channel: "email", channelIdentifier: "a", clientContact: "A", assignedToId: "e-1", assignedToName: "Engineer", assignedToRole: "Support", currentStageRole: "support_agent", slaDeadline: "", slaRisk: "On Target", createdAt: "", updatedAt: "", timeAgo: "now", tags: [], systemRevision: "1", environment: "prod", timeline: [] };
const company = { id: "c-1", code: "AC", name: "Acme", tier: "Gold", contactName: "A", contactRole: "Owner", contactEmail: "a@a", contactPhone: "1", preferredChannel: "email", activeContracts: 1, activeTickets: 1, slaResponseTime: "4h", accountManager: "Manager", subscribedServices: [service.name], status: "Active" } as Company;

describe("services workspace", () => {
  it("filters the catalog by department and uses numeric pagination", () => {
    const onViewService = vi.fn();
    render(<ServiceTable services={[service, { ...service, id: "svc-2", name: "QA", department: "Quality" }]} onViewService={onViewService} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter by Department" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Infrastructure" }));
    expect(screen.getByText("Cloud Operations")).toBeInTheDocument();
    expect(screen.queryByText("QA")).not.toBeInTheDocument();
    expect(screen.getByTestId("numeric-pagination")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /visibilityView/ }));
    expect(onViewService).toHaveBeenCalledWith("svc-1");
  });

  it("renders linked tickets and subscribed companies in their tabs", () => {
    const onOpenTicket = vi.fn();
    render(<ServiceDetailHero service={service} tickets={[ticket]} companies={[company]} onUpdateService={vi.fn()} onOpenTicket={onOpenTicket} />);
    fireEvent.click(screen.getByRole("button", { name: "Linked Tickets" }));
    fireEvent.click(screen.getByRole("button", { name: "TCK-1" }));
    expect(onOpenTicket).toHaveBeenCalledWith("t-1");
    fireEvent.click(screen.getByRole("button", { name: "Subscribed Companies" }));
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});
