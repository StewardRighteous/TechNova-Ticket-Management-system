import type { Ticket } from "../../types/barrel";
import { Button, DetailBanner, Icon, type BannerStatusTone } from "../../ui/barrel";

const statusTones: Record<Ticket["status"], BannerStatusTone> = {
  Open: "info",
  "In Progress": "info",
  Escalated: "warning",
  "Under Review": "review",
  "Pending QA": "pending",
  Resolved: "positive",
  Closed: "neutral",
};

export function HeroBanner({ ticket, onDelete }: { ticket: Ticket; onDelete?: () => void }) {
  return <DetailBanner
    title={ticket.title || "Untitled ticket"}
    status={ticket.status}
    statusTone={statusTones[ticket.status]}
    subtitle={<span className="font-mono font-bold">{ticket.code}</span>}
    icon={<Icon className="text-[23px]">confirmation_number</Icon>}
    metrics={[
      ["Assignee", ticket.assignedToName || "Unassigned", "person"],
      ["Customer", ticket.companyName || "No customer", "domain"],
      ["Service", ticket.serviceName || "No service", "layers"],
      ["Priority", ticket.priority.replace(/^P\d\s*/, ""), "flag"],
    ]}
    actions={onDelete && <Button type="button" tone="inverseDanger" size="small" onClick={onDelete}>
      <Icon aria-hidden="true" className="text-sm">delete</Icon>Delete
    </Button>}
  />;
}
