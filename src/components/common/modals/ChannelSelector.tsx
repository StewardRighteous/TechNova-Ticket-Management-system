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
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">Channel <span className="text-red-600">*</span></label>
      <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-lg">
        <button
          type="button"
          onClick={() => setChannel("whatsapp")}
          className={`flex items-center justify-center gap-1.5 border px-3 py-2.5 text-sm font-semibold transition-all ${
            channel === "whatsapp"
              ? "border-indigo-500 bg-indigo-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>{" "}
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setChannel("email")}
          className={`flex items-center justify-center gap-1.5 border-y border-r px-3 py-2.5 text-sm font-semibold transition-all ${
            channel === "email"
              ? "border-indigo-500 bg-indigo-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>{" "}
          Email
        </button>
        <button
          type="button"
          onClick={() => setChannel("phone")}
          className={`flex items-center justify-center gap-1.5 border-y border-r px-3 py-2.5 text-sm font-semibold transition-all ${
            channel === "phone"
              ? "border-indigo-500 bg-indigo-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">call</span>{" "}
          Phone
        </button>
      </div>
    </div>
  );
};
