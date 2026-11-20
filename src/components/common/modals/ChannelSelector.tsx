import React from "react";
import type { InboundChannel } from "../../../types/barrel";

interface ChannelSelectorProps {
  channel: InboundChannel;
  setChannel: (channel: InboundChannel) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channel,
  setChannel,
}) => {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-sm font-bold text-slate-700">Channel <span className="text-red-600">*</span></label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose ticket channel">
        <button
          type="button"
          aria-pressed={channel === "whatsapp"}
          onClick={() => setChannel("whatsapp")}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
            channel === "whatsapp"
              ? "border-brand-indigo bg-brand-indigo text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-indigo hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>{" "}
          WhatsApp
        </button>
        <button
          type="button"
          aria-pressed={channel === "email"}
          onClick={() => setChannel("email")}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
            channel === "email"
              ? "border-brand-indigo bg-brand-indigo text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-indigo hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>{" "}
          Email
        </button>
        <button
          type="button"
          aria-pressed={channel === "phone"}
          onClick={() => setChannel("phone")}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
            channel === "phone"
              ? "border-brand-indigo bg-brand-indigo text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-indigo hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">call</span>{" "}
          Phone
        </button>
      </div>
    </div>
  );
};
