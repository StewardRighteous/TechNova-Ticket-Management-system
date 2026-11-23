import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ClientNotificationChannel } from "../../types/barrel";
import { useTicketStore } from "../../store/barrel";
import { canAccessTicket, canTransitionTicket } from "../../utils/rolePermissions";

export const ClientNotificationPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { data, activeRole, currentUser, notifyTicketClient, updateTicketStatus, addToast } = useTicketStore();
  const ticket = data.tickets.find((item) => item.id === ticketId && canAccessTicket(item, activeRole, currentUser?.id));
  const company = ticket ? data.companies.find((item) => item.id === ticket.companyId) : undefined;
  const contact = company?.contacts?.find((item) => item.id === ticket?.contactId);
  const clientEmail = contact?.email || (ticket?.channel === "email" ? ticket.channelIdentifier : company?.contactEmail) || "";
  const clientPhone = contact?.phone || (ticket?.channel === "phone" || ticket?.channel === "whatsapp" ? ticket.channelIdentifier : company?.contactPhone) || "";
  const phoneHref = clientPhone.replace(/[^\d+]/g, "");

  if (!ticket) {
    return <section role="status" className="m-6 rounded-xl border border-amber-200 bg-amber-50 p-6"><h1 className="text-lg font-semibold text-slate-900">Ticket unavailable</h1><p className="mt-2 text-sm text-slate-700">This ticket may not exist or may not be available to your role.</p><Link to="/tickets" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to tickets</Link></section>;
  }

  const notify = (channel: ClientNotificationChannel) => {
    notifyTicketClient(ticket.id, channel);
    addToast(`Client notification recorded via ${channel === "whatsapp" ? "WhatsApp" : channel}`, "success");
  };
  const canClose = Boolean(ticket.clientNotifiedVia) && canTransitionTicket(activeRole, ticket.status, "Closed");
  const closeTicket = () => {
    if (!canClose) return;
    updateTicketStatus(ticket.id, "Closed");
    navigate(`/tickets/${encodeURIComponent(ticket.id)}`);
  };

  return <div className="space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-center gap-3">
      <Link to={`/tickets/${encodeURIComponent(ticket.id)}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"><span aria-hidden="true">‹</span> Back to ticket</Link>
      <span className="text-sm text-slate-400">/</span>
      <span className="text-sm font-semibold text-slate-900">Notify client</span>
    </div>
    <section className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6" aria-labelledby="client-notification-heading">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{ticket.code}</p>
      <h1 id="client-notification-heading" className="mt-1 text-xl font-bold text-slate-900">Notify the client</h1>
      <p className="mt-1 text-sm text-slate-600">Choose how you told the client about the resolution before closing this ticket.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={clientEmail ? `mailto:${clientEmail}` : undefined} onClick={() => notify("email")} className="rounded-md bg-white px-3 py-2.5 text-xs font-bold text-blue-800 ring-1 ring-blue-200 hover:bg-blue-100"><span className="material-symbols-outlined mr-1 align-middle text-base">mail</span>Email client</a>
        <a href={phoneHref ? `https://wa.me/${phoneHref.replace(/^\+/, "")}` : undefined} target="_blank" rel="noreferrer" onClick={() => notify("whatsapp")} className="rounded-md bg-white px-3 py-2.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"><span className="material-symbols-outlined mr-1 align-middle text-base">chat</span>WhatsApp client</a>
        <a href={phoneHref ? `tel:${phoneHref}` : undefined} onClick={() => notify("phone")} className="rounded-md bg-white px-3 py-2.5 text-xs font-bold text-violet-800 ring-1 ring-violet-200 hover:bg-violet-100"><span className="material-symbols-outlined mr-1 align-middle text-base">phone</span>Call client</a>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700" role="status">{ticket.clientNotifiedVia ? `Client notified via ${ticket.clientNotifiedVia === "whatsapp" ? "WhatsApp" : ticket.clientNotifiedVia}. You can now close the ticket.` : "Client notification is required before closing."}</p>
      {ticket.status === "Resolved" && <div className="mt-5 flex justify-end"><button type="button" disabled={!canClose} onClick={closeTicket} className="rounded-md bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300">Close ticket</button></div>}
    </section>
  </div>;
};
