import React from "react";
export const EmptyState: React.FC<{ label?: string }> = ({
  label = "No records found",
}) => (
  <div className="px-6 py-12 text-center text-xs text-slate-500">
    <span className="material-symbols-outlined mb-2 block text-3xl text-slate-300">
      search_off
    </span>
    {label}
  </div>
);
