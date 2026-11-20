import React, { useEffect, useRef, useState } from "react";

export interface NumericPaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const NumericPagination: React.FC<NumericPaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = "",
}) => {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startEntry = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = totalItems === 0 ? 0 : Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with windowing / ellipses
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    pages.push(1);

    const leftBoundary = Math.max(2, safeCurrentPage - 1);
    const rightBoundary = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (leftBoundary > 2) {
      pages.push("...");
    }

    for (let i = leftBoundary; i <= rightBoundary; i++) {
      pages.push(i);
    }

    if (rightBoundary < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  useEffect(() => {
    if (!isPageSizeOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
        setIsPageSizeOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPageSizeOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPageSizeOpen]);

  return (
    <div
      className={`flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-3.5 select-none sm:flex-row ${className}`}
      data-testid="numeric-pagination"
    >
      {/* Range summary */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <span>Showing</span>
        <span className="font-semibold text-slate-900">{`${startEntry}–${endEntry}`}</span>
        <span>of</span>
        <span className="font-semibold text-slate-900">{totalItems}</span>
        <span>records</span>
      </div>

      {/* Numbered pagination controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-slate-400"
                >
                  …
                </span>
              );
            }

            const isCurrent = page === safeCurrentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex h-8 min-w-8 px-2 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Page size selector */}
      <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <span className="whitespace-nowrap">Rows per page</span>
        <span className="relative inline-flex" ref={pageSizeRef}>
          <button
            type="button"
            aria-label="Rows per page"
            aria-haspopup="listbox"
            aria-expanded={isPageSizeOpen}
            onClick={() => setIsPageSizeOpen((open) => !open)}
            className="inline-flex h-9 min-w-20 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 py-1 pl-3 pr-2 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
          >
            <span>{pageSize}</span>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-slate-500">{isPageSizeOpen ? "expand_less" : "expand_more"}</span>
          </button>
          {isPageSizeOpen && (
            <div role="listbox" aria-label="Rows per page options" className="max-h-64 min-w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden absolute right-0 bottom-full z-50 mb-2">
              {pageSizeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={opt === pageSize}
                  aria-label={`${opt} per page`}
                  onClick={() => {
                    onPageSizeChange(opt);
                    onPageChange(1);
                    setIsPageSizeOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${opt === pageSize ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-teal-50 hover:text-teal-900"}`}
                >
                  {opt}
                  {opt === pageSize && <span aria-hidden="true" className="material-symbols-outlined text-base">check</span>}
                </button>
              ))}
            </div>
          )}
        </span>
      </label>
    </div>
  );
};
