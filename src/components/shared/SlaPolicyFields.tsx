import { Button, Checkbox, Input, Label } from "../../ui/barrel";
import type { SlaPolicy } from "../../types/barrel";
import { ticketPriorities, weekdays } from "../../utils/supportPolicy";

const defaultCalendar = { timeZone: "UTC", weekdays: [1, 2, 3, 4, 5], opensAt: "09:00", closesAt: "17:00" };
const metrics = [["responseMinutes", "First response"], ["resolutionMinutes", "Resolution"]] as const;

export function SlaPolicyFields({ value, onChange }: { value: SlaPolicy; onChange: (value: SlaPolicy) => void }) {
  const calendar = value.calendar;
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold text-slate-800">SLA targets in minutes</legend>
      <div className="grid grid-cols-[minmax(5rem,0.8fr)_1fr_1fr] items-center gap-x-2 gap-y-1.5 text-xs">
        <span>Priority</span>
        {metrics.map(([key, label]) => <span key={key}>{label}</span>)}
        {ticketPriorities.map((priority) => (
          <div key={priority} className="contents">
            <span>{priority}</span>
            {metrics.map(([key, label]) => (
              <Input
                key={key}
                aria-label={`${priority} ${label.toLowerCase()} minutes`}

                type="number"
                min="1"
                max="525600"
                value={value.targets[priority]?.[key] ?? ""}
                onChange={(event) => onChange({
                  ...value,
                  targets: {
                    ...value.targets,
                    [priority]: { ...value.targets[priority], [key]: event.target.value ? Number(event.target.value) : undefined },
                  },
                })}
              />
            ))}
          </div>
        ))}
      </div>
      <section className={`overflow-hidden rounded-lg border ${calendar ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-slate-50/50"}`}>
        <Button tone="plain" type="button" aria-expanded={Boolean(calendar)} onClick={() => onChange({ ...value, calendar: calendar ? undefined : defaultCalendar })} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/70">
          <span><span className="block text-xs font-semibold text-slate-800">Support calendar</span><span className="mt-0.5 block text-[11px] text-slate-500">Limit SLA time to your business hours and working days.</span></span>
          <span aria-hidden="true" className={`material-symbols-outlined shrink-0 text-xl text-slate-500 transition-transform ${calendar ? "rotate-180" : ""}`}>expand_more</span>
        </Button>
        {calendar && <div className="space-y-3 border-t border-slate-200 bg-white p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Label variant="compact">Time zone<Input required value={calendar.timeZone} onChange={(event) => onChange({ ...value, calendar: { ...calendar, timeZone: event.target.value } })} /></Label>
            <Label variant="compact">Opens at<Input type="time" required value={calendar.opensAt} onChange={(event) => onChange({ ...value, calendar: { ...calendar, opensAt: event.target.value } })} /></Label>
            <Label variant="compact">Closes at<Input type="time" required value={calendar.closesAt} onChange={(event) => onChange({ ...value, calendar: { ...calendar, closesAt: event.target.value } })} /></Label>
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">Working days</span>
            <div className="grid grid-cols-7 gap-1.5">{weekdays.map((day, index) => {
              const selected = calendar.weekdays.includes(index);
              return <Label variant="plain" key={day} className={`flex cursor-pointer justify-center rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors ${selected ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                <Checkbox className="sr-only" checked={selected} onChange={(event) => onChange({
                  ...value, calendar: { ...calendar, weekdays: event.target.checked ? [...calendar.weekdays, index] : calendar.weekdays.filter((item) => item !== index) },
                })} />
                <span>{day}</span>
              </Label>;
            })}</div>
          </div>
        </div>}
      </section>
    </fieldset>
  );
}
