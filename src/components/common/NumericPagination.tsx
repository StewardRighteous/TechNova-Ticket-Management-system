import React from "react";

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
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Rows per page:</span>
        <div className="flex items-center gap-1">
          {pageSizeOptions.map((opt) => {
            const isSelected = pageSize === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onPageSizeChange(opt);
                  onPageChange(1);
                }}
                aria-label={`${opt} per page`}
                className={`flex h-7 px-2.5 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
