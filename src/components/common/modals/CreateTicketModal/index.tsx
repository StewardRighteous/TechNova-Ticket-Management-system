import React, { useState } from "react";
import { useTicketStore } from "../../../../store/barrel";
import type {
  Attachment,
  InboundChannel,
  TicketPriority,
  TicketDiagnosticData,
} from "../../../../types/barrel";
import { ChannelSelector } from "../ChannelSelector";

type IncidentCategory =
  | "Technical/Bug"
  | "Login"
  | "Billing"
  | "Feature Request";

export const CreateTicketModal: React.FC = () => {
  const { data, isCreateModalOpen, setIsCreateModalOpen, addTicket, addToast } =
    useTicketStore();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Channel & Customer Autocomplete
  const [channel, setChannel] = useState<InboundChannel>("whatsapp");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    data.companies[0]?.id || "",
  );
  const [selectedContactName, setSelectedContactName] = useState<string>("");
  const [title, setTitle] = useState("");
  const [serviceId, setServiceId] = useState(data.services[0]?.id || "");
  const [assignedToId, setAssignedToId] = useState(data.employees[0]?.id || "");
  const [priority, setPriority] = useState<TicketPriority>("P1 Urgent");

  // Step 2: Dynamic Category & Diagnostics
  const [category, setCategory] = useState<IncidentCategory>("Technical/Bug");
  const [description, setDescription] = useState("");
  const [initialNote, setInitialNote] = useState("");
  const [images, setImages] = useState<Attachment[]>([]);

  // Category dynamic inputs
  const [diagnosticData, setDiagnosticData] = useState<TicketDiagnosticData>({
    clusterNode: "cloud-cluster-01",
    errorMessage: "",
    errorCode: "",
    stepsToReproduce: "",
    affectedUsers: 1,
    expectedBehavior: "",
    actualBehavior: "",
  });
  const [billingInvoiceId, setBillingInvoiceId] = useState("");
  const [loginAccountUsername, setLoginAccountUsername] = useState("");
  const [featureImpact, setFeatureImpact] = useState("");

  if (!isCreateModalOpen) return null;

  // Companies filtered by autocomplete
  const filteredCompanies = data.companies.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    const matchesComp =
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    const matchesContact = c.contacts?.some(
      (cnt) =>
        cnt.name.toLowerCase().includes(q) ||
        cnt.email.toLowerCase().includes(q) ||
        cnt.phone.toLowerCase().includes(q),
    );
    return matchesComp || matchesContact;
  });

  const selectedCompany =
    data.companies.find((c) => c.id === selectedCompanyId) || data.companies[0];
  const service =
    data.services.find((s) => s.id === serviceId) || data.services[0];
  const assignee =
    data.employees.find((e) => e.id === assignedToId) || data.employees[0];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCurrentStep(2);
  };

  const handlePrev = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setTitle("");
    setDescription("");
    setInitialNote("");
    setImages([]);
    setCustomerSearch("");
    setIsCreateModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Build contact string
    const contactDisplay =
      selectedContactName ||
      `${selectedCompany.contactName} (${selectedCompany.contactRole})`;

    // Enrich diagnostic data based on category
    const finalDiagnostics: TicketDiagnosticData = {
      ...diagnosticData,
    };
    if (category === "Billing" && billingInvoiceId) {
      finalDiagnostics.errorCode = `INV:${billingInvoiceId}`;
    } else if (category === "Login" && loginAccountUsername) {
      finalDiagnostics.errorCode = `AUTH:${loginAccountUsername}`;
    } else if (category === "Feature Request" && featureImpact) {
      finalDiagnostics.expectedBehavior = `Enhancement Impact: ${featureImpact}`;
    }

    addTicket({
      code: "",
      title: title.trim(),
      description: description.trim(),
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      companyCode: selectedCompany.code,
      serviceId: service.id,
      serviceName: service.name,
      priority,
      status: "Open",
      channel,
      channelIdentifier: `${channel.toUpperCase()} Inbound #${Math.floor(1000 + Math.random() * 9000)}`,
      clientContact: contactDisplay,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      assignedToRole: assignee.roleTitle,
      currentStageRole: assignee.role,
      slaDeadline: priority.includes("P1") ? "1h remaining" : "4h remaining",
      slaRisk: priority.includes("P1") ? "At Risk" : "On Target",
      tags: [category, service.name.split(" ")[0], priority.split(" ")[0]],
      attachments: images,
      diagnosticData: finalDiagnostics,
      systemRevision: data.companyInfo.version,
      environment: "Production Cloud Cluster",
      initialNote:
        initialNote.trim() ||
        `Ticket intake processed via omnichannel ${channel.toUpperCase()} dispatch [Category: ${category}].`,
    });

    addToast(`Ticket "${title.trim()}" created successfully.`, "success");

    handleClose();
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
        {/* Header & Step Tracker */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">
              add_circle
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Create New Support Ticket
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                {currentStep === 1
                  ? "Step 1: Channel & Customer"
                  : "Step 2: Category & Diagnostics"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold">
              <span
                className={`flex size-6 items-center justify-center rounded-full ${
                  currentStep === 1
                    ? "bg-indigo-600 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                1
              </span>
              <span className="h-0.5 w-4 bg-slate-200" />
              <span
                className={`flex size-6 items-center justify-center rounded-full ${
                  currentStep === 2
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                2
              </span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* STEP 1: Channel & Customer Autocomplete */}
        {currentStep === 1 && (
          <form onSubmit={handleNext} className="mt-4 space-y-4 text-xs">
            <ChannelSelector channel={channel} setChannel={setChannel} />

            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Ticket Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ticket title (e.g. API webhook delivery timeout)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Customer Autocomplete & Selection */}
            <div>
              <label className="mb-1 block font-bold text-slate-700">
                Customer & Company Autocomplete
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search client or company (name, email, code)..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />

                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    const comp = data.companies.find((c) => c.id === e.target.value);
                    if (comp?.contacts?.[0]) {
                      setSelectedContactName(comp.contacts[0].name);
                    } else if (comp) {
                      setSelectedContactName(comp.contactName);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {filteredCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - Tier: {c.tier}
                    </option>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <option value="" disabled>
                      No matching clients found
                    </option>
                  )}
                </select>

                {/* Contact specific selector */}
                {selectedCompany?.contacts && selectedCompany.contacts.length > 0 && (
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                      Primary Contact Representative
                    </label>
                    <select
                      value={selectedContactName}
                      onChange={(e) => setSelectedContactName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {selectedCompany.contacts.map((cnt) => (
                        <option key={cnt.id} value={cnt.name}>
                          {cnt.name} &lt;{cnt.email}&gt; ({cnt.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
                  <option value="P4 Trivial">P4 Trivial (Cosmetic)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Subscribed Service
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

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <span>Next: Diagnostic Details</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Category & Dynamic Diagnostics */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="incident-category-select"
                  className="mb-1 block font-bold text-slate-700"
                >
                  Incident Category
                </label>
                <select
                  id="incident-category-select"
                  aria-label="Incident Category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as IncidentCategory)
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-semibold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Technical/Bug">Technical/Bug</option>
                  <option value="Login">Login</option>
                  <option value="Billing">Billing</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  Assignee
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

            {/* Dynamic diagnostic fields based on category */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-3">
              <span className="block text-[11px] font-bold tracking-wider text-indigo-900 uppercase">
                {category} Diagnostic Inputs
              </span>

              {category === "Technical/Bug" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="error-code-input"
                        className="mb-1 block font-semibold text-slate-700"
                      >
                        Error Message or Code
                      </label>
                      <input
                        id="error-code-input"
                        aria-label="Error Message or Code"
                        type="text"
                        value={diagnosticData.errorCode || ""}
                        onChange={(e) =>
                          setDiagnosticData({
                            ...diagnosticData,
                            errorCode: e.target.value,
                          })
                        }
                        placeholder="e.g. ERR_SSL_PROTOCOL_ERROR or HTTP 500"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cluster-node-input"
                        className="mb-1 block font-semibold text-slate-700"
                      >
                        Cluster / Server Node
                      </label>
                      <input
                        id="cluster-node-input"
                        type="text"
                        value={diagnosticData.clusterNode || ""}
                        onChange={(e) =>
                          setDiagnosticData({
                            ...diagnosticData,
                            clusterNode: e.target.value,
                          })
                        }
                        placeholder="e.g. k8s-node-us-east-4"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="steps-to-reproduce-input"
                      className="mb-1 block font-semibold text-slate-700"
                    >
                      Steps to Reproduce
                    </label>
                    <textarea
                      id="steps-to-reproduce-input"
                      aria-label="Steps to Reproduce"
                      rows={2}
                      value={diagnosticData.stepsToReproduce || ""}
                      onChange={(e) =>
                        setDiagnosticData({
                          ...diagnosticData,
                          stepsToReproduce: e.target.value,
                        })
                      }
                      placeholder="1. Login -> 2. Click checkout -> 3. Timeout occurs"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {category === "Billing" && (
                <div>
                  <label
                    htmlFor="billing-invoice-input"
                    className="mb-1 block font-semibold text-slate-700"
                  >
                    Invoice or Transaction ID
                  </label>
                  <input
                    id="billing-invoice-input"
                    aria-label="Invoice or Transaction ID"
                    type="text"
                    value={billingInvoiceId}
                    onChange={(e) => setBillingInvoiceId(e.target.value)}
                    placeholder="e.g. INV-2026-9021 or TXN_88492"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {category === "Login" && (
                <div>
                  <label
                    htmlFor="login-account-input"
                    className="mb-1 block font-semibold text-slate-700"
                  >
                    Affected Account or Username
                  </label>
                  <input
                    id="login-account-input"
                    aria-label="Affected Account or Username"
                    type="text"
                    value={loginAccountUsername}
                    onChange={(e) => setLoginAccountUsername(e.target.value)}
                    placeholder="e.g. user@clientdomain.com or SSO tenant ID"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {category === "Feature Request" && (
                <div>
                  <label
                    htmlFor="feature-impact-input"
                    className="mb-1 block font-semibold text-slate-700"
                  >
                    Business Impact & Justification
                  </label>
                  <input
                    id="feature-impact-input"
                    aria-label="Business Impact & Justification"
                    type="text"
                    value={featureImpact}
                    onChange={(e) => setFeatureImpact(e.target.value)}
                    placeholder="e.g. Speeds up monthly audit reconciliations by 40%"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="problem-description-input"
                className="mb-1 block font-bold text-slate-700"
              >
                Problem Description
              </label>
              <textarea
                id="problem-description-input"
                aria-label="Problem Description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide exact symptoms, impacted users, and logs..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
                        className="size-10 rounded object-cover"
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
              <label className="mb-1 block font-bold text-slate-700">
                Internal Note
              </label>
              <input
                type="text"
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="e.g. Received audio message from client director, escalated"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  arrow_back
                </span>
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
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
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
