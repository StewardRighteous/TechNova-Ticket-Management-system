import React from "react";
import type { Employee, RoleId } from "../../types/barrel";

interface DemoPersonaGridProps {
  employees: Employee[];
  roles: { id: RoleId; name: string; description: string }[];
  onSelectPersona: (empId: string) => void;
  onContinue: () => void;
  selectedEmployeeId?: string;
  heading?: string;
}

export const DemoPersonaGrid: React.FC<DemoPersonaGridProps> = ({
  employees,
  roles,
  onSelectPersona,
  onContinue,
  selectedEmployeeId,
  heading = "Choose a demo persona",
}) => {
  return (
    <section className="mt-2" aria-label={heading}>
      <div className="mb-4">
        <h2 className=" text-center text-[22px] font-bold tracking-tight text-[#1f2041]">
          {heading}
        </h2>
        <p className="text-center text-sm text-slate-500">
          Select a profile to continue as that team member.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {employees.map((emp) => (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelectPersona(emp.id)}
            aria-label={`Select ${emp.name}, ${roles.find((role) => role.id === emp.role)?.name || emp.roleTitle}`}
            aria-pressed={selectedEmployeeId === emp.id}
            className={`flex min-h-[76px] flex-col items-stretch justify-center gap-1 rounded-lg border p-3 text-left transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${selectedEmployeeId === emp.id ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50"}`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-5 font-bold break-words whitespace-normal text-slate-900">
                  {emp.name}
                </span>
                <span className="mt-0.5 block text-xs leading-4 font-medium break-words whitespace-normal text-slate-500">
                  {roles.find((role) => role.id === emp.role)?.name ||
                    emp.roleTitle}
                </span>
                <span className="sr-only">
                  You will sign in as {emp.name} with the{" "}
                  {roles.find((role) => role.id === emp.role)?.name ||
                    emp.roleTitle}{" "}
                  role.
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
  
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedEmployeeId}
          className="mt-3 w-full rounded-lg bg-[#102345] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18345f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue as selected <span aria-hidden="true">→</span>
        </button>

    </section>
  );
};
