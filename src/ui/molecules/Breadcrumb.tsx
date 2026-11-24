import { Button } from "../atoms/Button";
import React from "react";
export const Breadcrumb: React.FC<{
  section: string;
  current: string;
  onBack: () => void;
}> = ({ section, current, onBack }) => (
  <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-500">
    <Button tone="plain" onClick={onBack} className="text-indigo-600 hover:text-indigo-800">
      {section}
    </Button>
    <span className="text-slate-300">›</span>
    <span className="truncate">{current}</span>
  </div>
);
