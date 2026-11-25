import { Icon } from "../atoms/Icon";
import { Button } from "../atoms/Button";
import { Label } from "../atoms/Label";
import React from "react";
import type { InboundChannel } from "../../types/barrel";

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
      <Label variant="plain" className="mb-1 block text-sm font-bold text-slate-700">Channel <span className="text-red-600">*</span></Label>
      <div className="flex overflow-hidden rounded-md border border-slate-300" role="group" aria-label="Choose ticket channel">
        <Button tone="plain"
          type="button"
          aria-pressed={channel === "whatsapp"}
          onClick={() => setChannel("whatsapp")}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-sm font-semibold transition-all ${
            channel === "whatsapp"
              ? "border-brand-indigo bg-brand-indigo text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-indigo hover:bg-slate-50"
          }`}
        >
          <Icon className="text-[16px]">chat</Icon>{" "}
          WhatsApp
        </Button>
        <Button tone="plain"
          type="button"
          aria-pressed={channel === "email"}
          onClick={() => setChannel("email")}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 border-l border-slate-300 px-2 py-2 text-sm font-semibold transition-all ${
            channel === "email"
              ? "border-brand-indigo bg-brand-indigo text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-indigo hover:bg-slate-50"
          }`}
        >
          <Icon className="text-[16px]">mail</Icon>{" "}
          Email
        </Button>
        <Button tone="plain"
          type="button"
          aria-pressed={channel === "phone"}
          onClick={() => setChannel("phone")}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 border-l border-slate-300 px-2 py-2 text-sm font-semibold transition-all ${
            channel === "phone"
              ? "border-brand-indigo bg-brand-indigo text-white shadow-sm"
              : "border-slate-300 bg-white text-slate-700 hover:border-brand-indigo hover:bg-slate-50"
          }`}
        >
          <Icon className="text-[16px]">call</Icon>{" "}
          Phone
        </Button>
      </div>
    </div>
  );
};
