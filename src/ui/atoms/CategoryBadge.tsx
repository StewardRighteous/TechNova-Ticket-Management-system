const categoryColors = new Map([
  ["Enquiry", "border-blue-200 bg-blue-50 text-blue-700"],
  ["Client-provided details", "border-violet-200 bg-violet-50 text-violet-700"],
  ["Investigation", "border-amber-200 bg-amber-50 text-amber-800"],
  ["Handover", "border-teal-200 bg-teal-50 text-teal-800"],
]);

const positive = "border-emerald-200 bg-emerald-50 text-emerald-800";
const warning = "border-amber-200 bg-amber-50 text-amber-800";
const critical = "border-rose-200 bg-rose-50 text-rose-800";
const info = "border-blue-200 bg-blue-50 text-blue-800";
const accent = "border-violet-200 bg-violet-50 text-violet-800";
const neutral = "border-slate-200 bg-slate-100 text-slate-700";

const variantColors = {
  category: categoryColors,
  tier: new Map([
    ["Enterprise", accent],
    ["Tier 1 Enterprise", accent],
    ["Premium", info],
    ["Tier 2 Growth", info],
  ]),
  status: new Map([
    ["Active", positive],
    ["Available", positive],
    ["Busy", warning],
    ["Scheduled", info],
    ["Expired", critical],
  ]),
  sla: new Map([
    ["On Target", positive],
    ["At Risk", warning],
    ["Breached", critical],
  ]),
  flag: new Map([["Yes", positive]]),
  policy: new Map([["Contract override", accent]]),
};

export function CategoryBadge({
  category,
  variant = "category",
}: {
  category: string;
  variant?: keyof typeof variantColors;
}) {
  if (!category.trim()) return <span className="text-slate-500">N/A</span>;

  const color = variantColors[variant].get(category) ?? neutral;
  return (
    <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 align-middle ${color} ${variant === "category" ? "" : "text-[11px] font-semibold"}`}>
      {category}
    </span>
  );
}
