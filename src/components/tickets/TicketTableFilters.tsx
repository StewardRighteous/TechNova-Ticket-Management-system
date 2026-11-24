import { Button, Icon } from "../../ui/barrel";
import React from "react";
import { ComboboxFilter } from "../../ui/groups/ComboboxFilter";

export interface TicketDepartmentOption {
  id: string;
  name: string;
}

export interface TicketTableFiltersProps {
  channelFilter: string[];
  setChannelFilter: (channels: string[]) => void;
  priorityFilter: string[];
  setPriorityFilter: (priorities: string[]) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  departmentFilter: string[];
  setDepartmentFilter: (departments: string[]) => void;
  departmentOptions: TicketDepartmentOption[];
  onClearAll?: () => void;
  showStatus?: boolean;
  showPriority?: boolean;
  showChannelFilter?: boolean;
  showDepartmentFilter?: boolean;
}

const statusOptions = [
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
  { value: "Escalated", label: "Escalated" },
  { value: "Under Review", label: "Under Review" },
  { value: "Pending QA", label: "Pending QA" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

const priorityOptions = [
  { value: "P1 Urgent", label: "P1 Urgent" },
  { value: "P2 Normal", label: "P2 Normal" },
  { value: "P3 Low", label: "P3 Low" },
  { value: "P4 Trivial", label: "P4 Trivial" },
];

const channelOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

export const TicketTableFilters: React.FC<TicketTableFiltersProps> = ({
  channelFilter,
  setChannelFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  departmentOptions,
  onClearAll,
  showStatus = true,
  showPriority = true,
  showChannelFilter = true,
  showDepartmentFilter = true,
}) => {
  const deptComboboxOptions = departmentOptions.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const hasActiveFilters =
    channelFilter.length > 0 ||
    priorityFilter.length > 0 ||
    statusFilter.length > 0 ||
    departmentFilter.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Combobox Filter */}
      {showStatus && <ComboboxFilter
        label="Status"
        options={statusOptions}
        selectedValues={statusFilter}
        onChange={setStatusFilter}
        placeholder="Search status..."
      />}

      {/* Priority Combobox Filter */}
      {showPriority && <ComboboxFilter
        label="Priority"
        options={priorityOptions}
        selectedValues={priorityFilter}
        onChange={setPriorityFilter}
        placeholder="Search priority..."
      />}

      {/* Channel Combobox Filter */}
      {showChannelFilter && <ComboboxFilter
        label="Channel"
        options={channelOptions}
        selectedValues={channelFilter}
        onChange={setChannelFilter}
        placeholder="Search channel..."
      />}

      {/* Department Combobox Filter */}
      {showDepartmentFilter && <ComboboxFilter
        label="Department"
        options={deptComboboxOptions}
        selectedValues={departmentFilter}
        onChange={setDepartmentFilter}
        placeholder="Search department..."
      />}

      {hasActiveFilters && onClearAll && (
        <Button tone="plain"
          type="button"
          onClick={onClearAll}
          className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Icon className="text-[14px]">filter_alt_off</Icon>
        </Button>
      )}
    </div>
  );
};
