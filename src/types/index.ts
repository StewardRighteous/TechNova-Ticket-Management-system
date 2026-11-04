export type RoleId =
  | 'support_agent'
  | 'senior_support'
  | 'development_team'
  | 'qa'
  | 'account_manager'
  | 'operations_manager'
  | 'management';

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
  performedById?: string;
  author: string;
  role: string;
  action: string;
  timestamp: string;
  note: string;
  fromAssigneeId?: string;
  toAssigneeId?: string;
  fromTeamId?: string;
  toTeamId?: string;
  escalationReason?: string;
}

export interface TicketDiagnosticData {
  clusterNode?: string;
  affectedUsers?: number;
  errorRate?: string;
  browser?: string;
  operatingSystem?: string;
  device?: string;
  errorMessage?: string;
  errorCode?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface InternalNote {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  companyCode: string;
  contactId?: string;
  serviceId: string;
  serviceName: string;
  categoryId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: InboundChannel;
  channelIdentifier: string;
  clientContact: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;
  teamId?: string;
  currentStageRole: RoleId;
  slaDeadline: string;
  dueAt?: string;
  slaRisk: 'On Target' | 'At Risk' | 'Breached';
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  tags: string[];
  systemRevision: string;
  environment: string;
  diagnosticData?: TicketDiagnosticData;
  attachments?: Attachment[];
  internalNotes?: InternalNote[];
  resolutionDetails?: string;
  closedAt?: string;
  timeline: TicketTimelineItem[];
}

export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountIdentifier?: string;
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
  contacts?: CustomerContact[];
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
  departmentId?: string;
  teamId?: string;
  locationId?: string;
  permissions?: string[];
  activeTicketsCount: number;
  capacityMax: number;
  skills: string[];
  status: 'Available' | 'Busy' | 'Off Shift';
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  locationId?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
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
  teams?: Team[];
  departments?: Department[];
  locations?: Location[];
}
