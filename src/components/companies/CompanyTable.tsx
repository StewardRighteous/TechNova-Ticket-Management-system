import React, { useState } from "react";
import type { Company } from "../../types/barrel";
import { CallToAction, TableToolbar, Button, DataTable, Heading, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow, ComboboxFilter, NumericPagination, TableSearch } from "../../ui/barrel";

const companyMarks: Record<string, string> = {
  "comp-1": "apex",
  "comp-2": "cloudscale",
  "comp-3": "nexabio",
  "comp-4": "omnilogistics",
  "comp-5": "zenith",
  "comp-6": "innovatecorp",
};

interface CompanyTableProps {
  companies: Company[];
  onViewCompany: (companyId: string) => void;
  onCreateNew?: () => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onViewCompany,
  onCreateNew,
}) => {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const filtered = companies.filter((c) => {
    if (tierFilter !== "all" && c.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.accountManager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => {
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))));
  }, [filtered.length, pageSize]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 px-5 py-5 text-white sm:px-6">
        <Heading variant="plain" className="text-lg font-bold tracking-tight">All Companies</Heading>
        <p className="mt-1 text-xs text-slate-300">Browse and manage customer companies.</p>
      </div>
      <DataTable className="border-collapse"
        scroll
        toolbar={
          <TableToolbar>
            <TableSearch id="company-search" value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Filter companies or contacts..." aria-label="Filter companies or contacts" className="min-w-52 max-w-[480px] flex-1" />
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
              <ComboboxFilter label="Account tier" singleSelect selectedValues={tierFilter === "all" ? [] : [tierFilter]} onChange={(v) => { setTierFilter(v[0] || "all"); setPage(1); }} options={[...new Set(companies.map((c) => c.tier))].map((v) => ({ value: v, label: v }))} />
              {onCreateNew && <CallToAction icon="add" onClick={onCreateNew} className="shrink-0">New</CallToAction>}
            </div>
          </TableToolbar>
        }
        pagination={
          <NumericPagination
            totalItems={filtered.length}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50]}
          />
        }
      >
        <TableHead>
          <TableRow>
            <TableHeader density="edge">Company Name</TableHeader>
            <TableHeader>
              <span>Primary Executive</span>
            </TableHeader>
            <TableHeader>
              <span>Tier</span>
            </TableHeader>
            <TableHeader>
              <span>Lead</span>
            </TableHeader>

            <TableHeader>Email</TableHeader>

            <TableHeader>Tickets</TableHeader>
            <TableHeader density="edge" className="text-left">Action</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white">
          {paginated.map((c) => (
            <TableRow selected={selectedCompanyId === c.id}
              key={c.id}

              onSelect={() => setSelectedCompanyId(c.id)}
              onOpen={() => onViewCompany(c.id)}
            >
              <TableCell density="edge" className="whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  {c.logo && !c.logo.includes("#") ? <img src={c.logo} alt="" className="size-8 shrink-0 rounded object-contain" /> : <svg aria-hidden="true" className="size-8 shrink-0" viewBox="0 0 32 32">
                    <use href={c.logo ? `/${c.logo}` : `/company-marks.svg#${companyMarks[c.id] ?? "company"}`} />
                  </svg>}
                  <div>
                    <Button tone="plain" type="button" onClick={(event) => { event.stopPropagation(); onViewCompany(c.id); }} className="block text-left font-bold text-slate-900 transition-colors group-hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600">
                      {c.name}
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Icon className="text-slate-400">
                    account_circle
                  </Icon>
                  <div>
                    <span className="block w-fit cursor-text font-semibold text-slate-800">
                      {c.contactName}
                    </span>
                    <span className="cursor-text text-[10px] text-slate-500">
                      {c.contactRole}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                  <Icon className="text-slate-400">
                    domain
                  </Icon>
                  <span className="cursor-text">{c.tier}</span>
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                  <Icon className="text-slate-400">
                    person
                  </Icon>
                  <span className="cursor-text">{c.accountManager}</span>
                </span>
              </TableCell>

              <TableCell className="whitespace-nowrap">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-800">
                  <Icon className="text-[13px] text-slate-400">
                    mail
                  </Icon>
                  <span className="cursor-text">{c.contactEmail}</span>
                </span>
              </TableCell>

              <TableCell className="whitespace-nowrap text-slate-800">
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="text-[13px] text-slate-400">
                    confirmation_number
                  </Icon>
                  <span className="cursor-text">{c.activeTickets} Tickets</span>
                </span>
              </TableCell>
              <TableCell density="edge" className="text-left whitespace-nowrap">
                <Button tone="plain"
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onViewCompany(c.id); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <Icon className="text-[15px]">
                    visibility
                  </Icon>
                  <span>View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && <TableRow><TableCell density="plain" colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">{companies.length === 0 ? "No companies available." : "No matching companies. Try adjusting your search or filters."}</TableCell></TableRow>}
        </TableBody>
      </DataTable>
    </div>
  );
};
