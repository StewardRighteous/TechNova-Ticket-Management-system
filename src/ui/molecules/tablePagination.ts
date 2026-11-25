export const minimumTableFooterRows = 5;

export function getTablePageRows<Row>(rows: readonly Row[], page: number, pageSize: number) {
  if (rows.length < minimumTableFooterRows) return rows;

  const lastPage = Math.ceil(rows.length / pageSize);
  const currentPage = Math.min(Math.max(1, page), lastPage);
  return rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
}
