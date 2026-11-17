import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumericPagination } from "./index";

describe("NumericPagination", () => {
  it("renders correct record range counter (Showing X–Y of Z)", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <NumericPagination
        totalItems={42}
        currentPage={2}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 25, 50]}
      />
    );

    expect(screen.getByText("Showing")).toBeInTheDocument();
    expect(screen.getByText("11–20")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("handles 0 items gracefully", () => {
    render(
      <NumericPagination
        totalItems={0}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText("0–0")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders numbered page buttons and handles page windowing with ellipsis", () => {
    const onPageChange = vi.fn();

    // 100 items with pageSize=10 means 10 pages
    render(
      <NumericPagination
        totalItems={100}
        currentPage={5}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />
    );

    // Page 1, Page 5 (current), Page 10 should be visible
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 10" })).toBeInTheDocument();

    // Click next page button
    const nextBtn = screen.getByRole("button", { name: "Next page" });
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(6);

    // Click previous page button
    const prevBtn = screen.getByRole("button", { name: "Previous page" });
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(4);

    // Click a numbered button
    const page1Btn = screen.getByRole("button", { name: "Page 1" });
    fireEvent.click(page1Btn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("disables previous button on first page and next button on last page", () => {
    const { rerender } = render(
      <NumericPagination
        totalItems={25}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();

    rerender(
      <NumericPagination
        totalItems={25}
        currentPage={3}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Previous page" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("changes page size when selector options are clicked and resets to page 1", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <NumericPagination
        totalItems={100}
        currentPage={4}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 25, 50]}
      />
    );

    const btn25 = screen.getByRole("button", { name: "25 per page" });
    fireEvent.click(btn25);

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
