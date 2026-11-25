import type { Ticket } from "../../types/barrel";
import { CopyIconButton, ReadOnlyField } from "../../ui/barrel";

const diagnosticFields = [
  { name: "errorMessage", label: "Error message" },
  { name: "errorCode", label: "Error code" },
  { name: "clusterNode", label: "Cluster or server node" },
  { name: "affectedUsers", label: "Affected users" },
  { name: "expectedBehavior", label: "Expected behavior", multiline: true },
  { name: "actualBehavior", label: "Actual behavior", multiline: true },
  { name: "stepsToReproduce", label: "Steps to reproduce", multiline: true },
] as const;

function formatFieldValue(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/\\n/g, "\n")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .join("\n")
    .trim();
}

interface IssueOverviewCardProps {
  ticket: Ticket;
  onCopy: (text: string, label: string) => void;
}

export function IssueOverviewCard({ ticket, onCopy }: IssueOverviewCardProps) {
  const fields = ([
    { name: "description", label: "Issue overview", multiline: true, value: ticket.description },
    ...diagnosticFields.map((field) => ({ ...field, value: ticket.diagnosticData?.[field.name] })),
  ] as const).map((field) => ({ ...field, text: formatFieldValue(field.value) }));

  const issueText = fields
    .filter(({ text }) => text)
    .map(({ label, text }) => `${label}\n${text}`)
    .join("\n\n");

  return (
    <section aria-label="Ticket issue" className="grid gap-x-6 gap-y-4 p-5 md:grid-cols-2">
      {fields.map((field) => {
        const { name, label, text } = field;
        const wide = name === "description" || name === "stepsToReproduce";
        return (
          <ReadOnlyField
            key={name}
            label={label}
            value={text}
            multiline={"multiline" in field && field.multiline}
            minRows={name === "stepsToReproduce" ? 4 : 2}
            className={wide ? "col-span-full min-w-0" : "min-w-0"}
            labelAction={name === "description" && issueText && (
              <CopyIconButton label="Issue" variant="labeled" onCopy={() => onCopy(issueText, "Issue")} />
            )}
          />
        );
      })}
    </section>
  );
}
