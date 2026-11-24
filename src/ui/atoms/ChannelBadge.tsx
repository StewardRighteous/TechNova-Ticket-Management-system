import { Icon } from "./Icon";
import React from 'react';
import type { InboundChannel } from "../../types/barrel";

interface ChannelBadgeProps {
  channel: InboundChannel;
  showText?: boolean;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel, showText = true }) => {
  switch (channel) {
    case 'whatsapp':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200" title="WhatsApp Channel">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <Icon className="text-[13px] text-emerald-600">chat</Icon>
          {showText && <span>WhatsApp</span>}
        </span>
      );
    case 'email':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200" title="Email Channel">
          <Icon className="text-[13px] text-blue-600">mail</Icon>
          {showText && <span>Email</span>}
        </span>
      );
    case 'phone':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200" title="Phone Channel">
          <Icon className="text-[13px] text-purple-600">call</Icon>
          {showText && <span>Phone</span>}
        </span>
      );
    default:
      return null;
  }
};
