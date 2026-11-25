export type RoleId =
  | 'support_agent'
  | 'senior_support'
  | 'development_team'
  | 'qa'
  | 'account_manager'
  | 'operations_manager'
  | 'management';

export type InboundChannel = 'whatsapp' | 'email' | 'phone';
export type ClientNotificationChannel = 'email' | 'whatsapp' | 'phone';

export type TicketPriority = 'P1 Urgent' | 'P2 Normal' | 'P3 Low' | 'P4 Trivial';

export interface SupportCalendar {
  timeZone: string;
  weekdays: number[];
  opensAt: string;
  closesAt: string;
}

export interface SlaPolicy {
  targets: Partial<Record<TicketPriority, { responseMinutes?: number; resolutionMinutes?: number }>>;
  calendar?: SupportCalendar;
}

export interface SupportContract {
  id: string;
  reference: string;
  serviceIds: string[];
  status: "Active" | "Inactive";
  startsOn?: string;
  endsOn?: string;
  slaPolicy?: SlaPolicy;
}

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
  kind?: "customer" | "workflow";
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
  uploadedAt?: string;
  category?: string;
}

export type NoteType = "General" | "Enquiry" | "Client-provided details" | "Investigation" | "Handover";

export interface InternalNote {
  id: string;
  authorId: string;
  body: string;
  type?: NoteType;
  pinned?: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  contactId?: string;
  serviceId: string;
  serviceName: string;
  categoryId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: InboundChannel;
  channelIdentifier: string;
  clientContact: string;
  clientEmailOverride?: string;
  clientPhoneOverride?: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;
  teamId?: string;
  currentStageRole: RoleId;
  slaDeadline: string;
  slaPolicyApplied?: true;
  firstResponseDueAt?: string;
  firstRespondedAt?: string;
  resolvedAt?: string;
  dueAt?: string;
  slaRisk: 'On Target' | 'At Risk' | 'Breached';
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  tags: string[];
  systemRevision: string;
  environment: string;
  supportSite?: string;
  diagnosticData?: TicketDiagnosticData;
  attachments?: Attachment[];
  internalNotes?: InternalNote[];
  resolutionDetails?: string;
  clientNotifiedAt?: string;
  clientNotifiedVia?: ClientNotificationChannel;
  clientNotificationNotes?: string;
  closedAt?: string;
  timeline: TicketTimelineItem[];
}

export interface CustomerContact {
  id: string;
  name: string;
  role?: string;
  email: string;
  phone: string;
  accountIdentifier?: string;
}

export interface Company {
  id: string;
  logo?: string;
  code: string;
  name: string;
  tier: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  contacts?: CustomerContact[];
  primaryContactId?: string;
  escalationContactId?: string;
  supportSites?: string[];
  contracts?: SupportContract[];
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
  accountStatus?: "Active" | "Disabled";
  eligibleServiceIds?: string[];
  supportSchedule?: string;
  timeZone?: string;
  // Optional HR data keeps existing demo records and integrations backwards compatible.
  dateOfBirth?: string;
  gender?: string;
  personalAddress?: string;
  employmentType?: string;
  hireDate?: string;
  managerName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  routingNumber?: string;
  taxId?: string;
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
  logo?: string;
  name: string;
  code: string;
  department: string;
  lead: string;
  leadEmployeeId?: string | null;
  activeTickets: number;
  slaTarget: string;
  uptime: string;
  description: string;
  technologies: string[];
  status: string;
  slaPolicy?: SlaPolicy;
  uptimeTarget?: string;
  defaultTeamId?: string;
  escalationTeamId?: string;
  onCallContactId?: string;
  escalationGuidelines?: string;
  runbookUrl?: string;
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  ticketId?: string;
  icon: string;
  readBy?: string[];
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface MockupDatabase {
  companyInfo: CompanyInfo;
  roles: { id: RoleId; name: string; description: string }[];
  inboundChannels: { id: InboundChannel; name: string; icon: string; color: string; bgColor: string }[];
  services: ServiceLine[];
  companies: Company[];
  employees: Employee[];
  tickets: Ticket[];
  notifications: Notification[];
  teams?: Team[];
  departments?: Department[];
  locations?: Location[];
}
