export type RoleId =
  | 'support_agent'
  | 'senior_support'
  | 'development_team'
  | 'qa'
  | 'account_manager'
  | 'operations_manager';

export type InboundChannel = 'whatsapp' | 'email' | 'phone';

export type TicketPriority = 'P1 Urgent' | 'P2 Normal' | 'P3 Low' | 'P4 Trivial';

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Escalated'
  | 'Under Review'
  | 'Pending QA'
  | 'Resolved'
  | 'Closed';

export interface TicketTimelineItem {
  id: string;
  author: string;
  role: string;
  action: string;
  timestamp: string;
  note: string;
}

export interface TicketDiagnosticData {
  clusterNode?: string;
  affectedUsers?: number;
  errorRate?: string;
}

export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyCode: string;
  serviceId: string;
  serviceName: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: InboundChannel;
  channelIdentifier: string;
  clientContact: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;
  currentStageRole: RoleId;
  slaDeadline: string;
  slaRisk: 'On Target' | 'At Risk' | 'Breached';
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  tags: string[];
  systemRevision: string;
  environment: string;
  diagnosticData?: TicketDiagnosticData;
  timeline: TicketTimelineItem[];
}

export interface Company {
  id: string;
  code: string;
  name: string;
  tier: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  preferredChannel: InboundChannel;
  activeContracts: number;
  activeTickets: number;
  slaResponseTime: string;
  accountManager: string;
  subscribedServices: string[];
  status: string;
}

export interface Employee {
  id: string;
  name: string;
  role: RoleId;
  roleTitle: string;
  email: string;
  phone: string;
  avatar: string;
  activeTicketsCount: number;
  capacityMax: number;
  skills: string[];
  status: 'Available' | 'Busy' | 'Off Shift';
}

export interface ServiceLine {
  id: string;
  name: string;
  code: string;
  department: string;
  lead: string;
  activeTickets: number;
  slaTarget: string;
  uptime: string;
  description: string;
  technologies: string[];
  status: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  version: string;
  slaHealth: string;
  activeBacklog: number;
  allocatedWorkload: string;
  assignedToEngineers: number;
  activeAgents: number;
  avgPerAgent: number;
}

export interface MockupDatabase {
  companyInfo: CompanyInfo;
  roles: { id: RoleId; name: string; description: string }[];
  inboundChannels: { id: InboundChannel; name: string; icon: string; color: string; bgColor: string }[];
  services: ServiceLine[];
  companies: Company[];
  employees: Employee[];
  tickets: Ticket[];
}
