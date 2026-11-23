import type { ServiceLine } from "../types/barrel";

export function matchesService(service: ServiceLine, reference: string) {
  const normalized = reference.trim().toLowerCase();
  return [service.id, service.code, service.name].some((value) => value.toLowerCase() === normalized);
}
