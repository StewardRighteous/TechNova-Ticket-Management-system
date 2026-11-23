import type { Company, Employee, ServiceLine, SlaPolicy, SupportCalendar, SupportContract, Ticket, TicketPriority } from "../types/barrel";

export const ticketPriorities: TicketPriority[] = ["P1 Urgent", "P2 Normal", "P3 Low", "P4 Trivial"];
export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isEligibleAssignee(employee: Employee, serviceId?: string) {
  return employee.accountStatus !== "Disabled"
    && employee.status !== "Off Shift"
    && (!serviceId || !employee.eligibleServiceIds?.length || employee.eligibleServiceIds.includes(serviceId));
}

export function ticketSlaRisk(ticket: Ticket, now = Date.now()): Ticket["slaRisk"] {
  const dates = [[ticket.firstResponseDueAt, ticket.firstRespondedAt], [ticket.dueAt, ticket.resolvedAt]];
  if (!ticket.slaPolicyApplied) return ticket.slaRisk;
  const completed = ticket.status === "Resolved" || ticket.status === "Closed";
  let atRisk = false;
  for (const [deadline, completedAt] of dates) {
    if (!deadline) continue;
    const due = Date.parse(deadline);
    const end = completedAt ? Date.parse(completedAt) : now;
    if (end > due) return "Breached";
    if (!completedAt && !completed && due - now <= 15 * 60_000) atRisk = true;
  }
  return atRisk ? "At Risk" : "On Target";
}

export function durationMinutes(value?: string) {
  const match = value?.trim().match(/^(\d+(?:\.\d+)?)\s*(m(?:in(?:utes?)?)?|h(?:ours?|rs?)?|d(?:ays?)?)$/i);
  if (!match) return undefined;
  const unit = match[2][0].toLowerCase();
  const minutes = Math.round(Number(match[1]) * (unit === "d" ? 1440 : unit === "h" ? 60 : 1));
  return Number.isSafeInteger(minutes) && minutes > 0 && minutes <= 525_600 ? minutes : undefined;
}

export function contractStatus(contract: SupportContract, day = new Date().toISOString().slice(0, 10)) {
  if (contract.status === "Inactive") return "Inactive";
  if (contract.startsOn && contract.startsOn > day) return "Scheduled";
  if (contract.endsOn && contract.endsOn < day) return "Expired";
  return "Active";
}

export function isContractActive(contract: SupportContract, day?: string) {
  return contractStatus(contract, day) === "Active";
}

export function validTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return Boolean(timeZone);
  } catch {
    return false;
  }
}

export function policyError(policy?: SlaPolicy) {
  const calendar = policy?.calendar;
  if (!calendar) return "";
  if (!validTimeZone(calendar.timeZone)) return "Enter a valid time zone, such as Asia/Kolkata.";
  if (!calendar.weekdays.length || !calendar.opensAt || !calendar.closesAt || calendar.opensAt >= calendar.closesAt) {
    return "Select support days and an opening time before the closing time.";
  }
  return "";
}

function clockMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function addSupportMinutes(start: Date, minutes: number, calendar?: SupportCalendar) {
  const minuteMs = 60_000;
  if (!calendar || policyError({ targets: {}, calendar })) return new Date(start.getTime() + minutes * minuteMs);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: calendar.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const opensAt = clockMinutes(calendar.opensAt);
  const closesAt = clockMinutes(calendar.closesAt);
  let time = start.getTime();
  let remaining = minutes * minuteMs;

  while (remaining > 0) {
    const parts = formatter.formatToParts(time);
    const weekday = weekdays.indexOf(parts.find((part) => part.type === "weekday")?.value ?? "");
    const localMinute = Number(parts.find((part) => part.type === "hour")?.value) * 60
      + Number(parts.find((part) => part.type === "minute")?.value);
    const workingDay = calendar.weekdays.includes(weekday);
    const open = workingDay && localMinute >= opensAt && localMinute < closesAt;
    const nextHour = 60 - localMinute % 60;
    const nextBoundary = !workingDay || localMinute >= closesAt ? nextHour
      : Math.min(nextHour, (open ? closesAt : opensAt) - localMinute);
    const elapsed = nextBoundary * minuteMs - time % minuteMs;
    if (open && remaining <= elapsed) return new Date(time + remaining);
    if (open) remaining -= elapsed;
    time += elapsed;
  }
  return new Date(time);
}

export function calculateTicketSla(company: Company, service: ServiceLine, priority: TicketPriority, start: Date) {
  const day = start.toISOString().slice(0, 10);
  const contractPolicy = (company.contracts ?? [])
    .filter((contract) => isContractActive(contract, day) && contract.serviceIds.includes(service.id) && contract.slaPolicy)
    .sort((a, b) => (b.startsOn ?? "").localeCompare(a.startsOn ?? "") || a.reference.localeCompare(b.reference))[0]?.slaPolicy;
  const serviceTarget = service.slaPolicy?.targets[priority];
  const contractTarget = contractPolicy?.targets[priority];
  const responseMinutes = contractTarget?.responseMinutes ?? serviceTarget?.responseMinutes
    ?? durationMinutes(service.slaTarget) ?? durationMinutes(company.slaResponseTime);
  const resolutionMinutes = contractTarget?.resolutionMinutes ?? serviceTarget?.resolutionMinutes;
  const calendar = contractPolicy?.calendar ?? service.slaPolicy?.calendar;
  return {
    slaPolicyApplied: responseMinutes || resolutionMinutes ? true as const : undefined,
    firstResponseDueAt: responseMinutes ? addSupportMinutes(start, responseMinutes, calendar).toISOString() : undefined,
    dueAt: resolutionMinutes ? addSupportMinutes(start, resolutionMinutes, calendar).toISOString() : undefined,
    slaDeadline: responseMinutes ? `${responseMinutes}m first response` : "No first-response target",
  };
}

export function formatSupportDeadline(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
    : value;
}
