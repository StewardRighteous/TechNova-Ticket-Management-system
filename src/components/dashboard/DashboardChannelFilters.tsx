import React from "react";
import type { InboundChannel } from "../../types/barrel";

interface DashboardChannelFiltersProps {
  channelFilter: "all" | InboundChannel;
  setChannelFilter: (c: "all" | InboundChannel) => void;
  onExploreAll: () => void;
}

export const DashboardChannelFilters: React.FC<
  DashboardChannelFiltersProps
> = ({ channelFilter, setChannelFilter, onExploreAll }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
        <button
          onClick={() => setChannelFilter("all")}
          className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
            channelFilter === "all"
              ? "border bg-white text-indigo-700 shadow-sm"
              : "text-slate-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setChannelFilter("whatsapp")}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
            channelFilter === "whatsapp"
              ? "border bg-white text-emerald-700 shadow-sm"
              : "text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">chat</span>{" "}
          WhatsApp
        </button>
        <button
          onClick={() => setChannelFilter("email")}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
            channelFilter === "email"
              ? "border bg-white text-blue-700 shadow-sm"
              : "text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">mail</span>{" "}
          Email
        </button>
        <button
          onClick={() => setChannelFilter("phone")}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
            channelFilter === "phone"
              ? "border bg-white text-purple-700 shadow-sm"
              : "text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">call</span>{" "}
          Phone
        </button>
      </div>

      <button
        onClick={onExploreAll}
        className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-950"
      >
        <span>All Tickets</span>
        <span className="material-symbols-outlined text-[15px]">
          arrow_forward
        </span>
      </button>
    </div>
  );
};
