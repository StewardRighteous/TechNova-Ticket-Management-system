import { Icon } from "./Icon";
import type { InboundChannel } from "../../types/barrel";

const channelStyles = {
  whatsapp: {
    label: "WhatsApp",
    icon: "chat",
    iconColor: "text-emerald-600",
    badgeColor: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  email: {
    label: "Email",
    icon: "mail",
    iconColor: "text-blue-600",
    badgeColor: "border-blue-200 bg-blue-100 text-blue-800",
  },
  phone: {
    label: "Phone",
    icon: "call",
    iconColor: "text-purple-600",
    badgeColor: "border-purple-200 bg-purple-100 text-purple-800",
  },
};

interface ChannelBadgeProps {
  channel: InboundChannel;
  showText?: boolean;
}

export function ChannelIcon({ channel }: { channel: InboundChannel }) {
  if (!Object.hasOwn(channelStyles, channel)) return null;
  const { label, icon, iconColor } = channelStyles[channel];
  return (
    <Icon role="img" aria-label={label} title={`${label} Channel`} className={`align-middle text-[15px] ${iconColor}`}>
      {icon}
    </Icon>
  );
}

export function ChannelBadge({ channel, showText = true }: ChannelBadgeProps) {
  if (!Object.hasOwn(channelStyles, channel)) return null;
  const { label, icon, iconColor, badgeColor } = channelStyles[channel];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeColor}`} title={`${label} Channel`}>
      {channel === "whatsapp" && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />}
      <Icon aria-hidden="true" className={`text-[13px] ${iconColor}`}>{icon}</Icon>
      {showText && <span>{label}</span>}
    </span>
  );
}
