import React from 'react';
import type { InboundChannel } from '../../types';

interface ChannelSelectorProps {
  channel: InboundChannel;
  setChannel: (channel: InboundChannel) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({ channel, setChannel }) => {
  return (
    <div>
      <label className="block font-bold text-slate-700 mb-1">Inbound Channel</label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setChannel('whatsapp')}
          className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
            channel === 'whatsapp'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setChannel('email')}
          className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
            channel === 'email'
              ? 'border-blue-500 bg-blue-50 text-blue-800'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">mail</span> Email
        </button>
        <button
          type="button"
          onClick={() => setChannel('phone')}
          className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
            channel === 'phone'
              ? 'border-purple-500 bg-purple-50 text-purple-800'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">call</span> Phone
        </button>
      </div>
    </div>
  );
};
