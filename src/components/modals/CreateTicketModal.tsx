import React, { useState } from "react";
import { useTicketStore } from "../../store";
import type { Attachment, InboundChannel, TicketPriority } from "../../types";
import { ChannelSelector } from "./ChannelSelector";

export const CreateTicketModal: React.FC = () => {
  const { data, isCreateModalOpen, setIsCreateModalOpen, addTicket } =
    useTicketStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState(data.companies[0]?.id || "");
  const [serviceId, setServiceId] = useState(data.services[0]?.id || "");
  const [assignedToId, setAssignedToId] = useState(data.employees[0]?.id || "");
  const [channel, setChannel] = useState<InboundChannel>("whatsapp");
  const [priority, setPriority] = useState<TicketPriority>("P1 Urgent");
  const [initialNote, setInitialNote] = useState("");
  const [images, setImages] = useState<Attachment[]>([]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const company =
      data.companies.find((c) => c.id === companyId) || data.companies[0];
    const service =
      data.services.find((s) => s.id === serviceId) || data.services[0];
    const assignee =
      data.employees.find((e) => e.id === assignedToId) || data.employees[0];

    addTicket({
      code: "",
      title: title.trim(),
      description: description.trim(),
      companyId: company.id,
      companyName: company.name,
      companyCode: company.code,
      serviceId: service.id,
      serviceName: service.name,
      priority,
      status: "Open",
      channel,
      channelIdentifier: `${channel.toUpperCase()} Inbound #${Math.floor(1000 + Math.random() * 9000)}`,
      clientContact: `${company.contactName} (${company.contactRole})`,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      assignedToRole: assignee.roleTitle,
      currentStageRole: assignee.role,
      slaDeadline: priority.includes("P1") ? "1h remaining" : "4h remaining",
      slaRisk: "On Target",
      tags: [service.name.split(" ")[0], priority.split(" ")[0]],
      attachments: images,
      systemRevision: data.companyInfo.version,
      environment: "Production Cloud Cluster",
      initialNote:
        initialNote.trim() ||
        "Ticket intake processed via omnichannel dispatch.",
    });

    setImages([]);
    setIsCreateModalOpen(false);
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    Promise.all(
      files.map(
        (file) =>
          new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                url: String(reader.result),
                mimeType: file.type,
                size: file.size,
              });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((selectedImages) =>
        setImages((current) => [...current, ...selectedImages]),
      )
      .catch(() => {});
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">
              add_circle
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Create New Support Ticket
            </h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <ChannelSelector channel={channel} setChannel={setChannel} />

          <div>
            <label className="mb-1 block font-bold text-slate-700">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Webhook delivery failure on payment batch sync"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Company
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Service
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="P1 Urgent">P1 Urgent (Critical Outage)</option>
                <option value="P2 Normal">P2 Normal (Major Defect)</option>
                <option value="P3 Low">P3 Low (Minor Inquiry)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Assigned To
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700">
              Problem Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact symptoms, impacted users, and logs..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700">
              Images (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <span className="max-w-40 truncate text-[11px] text-slate-600">
                      {image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setImages((current) =>
                          current.filter((item) => item.id !== image.id),
                        )
                      }
                      aria-label={`Remove ${image.name}`}
                      className="text-slate-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700">Note</label>
            <input
              type="text"
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="e.g. Received audio message from client director, escalated to senior support"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
