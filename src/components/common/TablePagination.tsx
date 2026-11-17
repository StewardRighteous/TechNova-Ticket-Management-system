import React from "react";

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-4 select-none md:flex-row">
      {/* Left: nth entries count */}
      <div className="flex gap-1 text-xs font-medium text-slate-500">
        Showing <span className="font-bold text-slate-800">{startEntry}</span>
        to <span className="font-bold text-slate-800">{endEntry}</span> out of
        <span className="font-bold text-slate-800">{totalItems}</span> entries
      </div>
      {/* Center: Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">
            first_page
          </span>
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_left
          </span>
        </button>

        <span className="mx-1 rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next Page"
          className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Last Page"
          className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">
            last_page
          </span>
        </button>
      </div>
      {/* Right: Adaptive page-size selector */}
      <div
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
        data-testid="table-page-size"
      >
        <div className="flex items-center gap-1.5 px-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          <span className="material-symbols-outlined text-[16px] text-slate-400">
            view_list
          </span>
          <span>Rows</span>
        </div>
        <div
          className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs"
          role="group"
          aria-label="Rows per page"
        >
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
                aria-label={`${opt} rows per page`}
                aria-pressed={isSelected}
                className={`min-w-9 rounded-md px-2 py-1.5 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <span className="pr-1 text-[11px] font-medium text-slate-400">
          / page
        </span>
      </div>
    </div>
  );
};
