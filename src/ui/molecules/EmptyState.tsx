import { Icon } from "../atoms/Icon";
import React from "react";
export const EmptyState: React.FC<{ label?: string }> = ({
  label = "No records found",
}) => (
  <div className="px-6 py-12 text-center text-sm text-slate-600">
    <Icon aria-hidden="true" className="mb-2 block text-3xl text-slate-400">
      search_off
    </Icon>
    {label}
  </div>
);
