import React from 'react';

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
  pageSizeOptions = [5, 10, 20, 50]
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* Left: nth entries count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{startEntry}</span> to{' '}
        <span className="font-bold text-slate-800">{endEntry}</span> out of{' '}
        <span className="font-bold text-slate-800">{totalItems}</span> entries
      </div>

      {/* Center: Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[16px]">first_page</span>
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md mx-1">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next Page"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Last Page"
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[16px]">last_page</span>
        </button>
      </div>

      {/* Right: Stepper / Page Size Selector */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
