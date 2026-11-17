import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComboboxFilter } from "./index";

describe("ComboboxFilter", () => {
  const sampleOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  it("renders trigger button with label and selected count", () => {
    const onChange = vi.fn();
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={["open", "resolved"]}
        onChange={onChange}
      />
    );

    expect(screen.getByRole("button", { name: "Filter by Status" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens dropdown and allows toggling option selections", () => {
    const onChange = vi.fn();
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={["open"]}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole("button", { name: "Filter by Status" });
    fireEvent.click(trigger);

    // Dropdown list items should now be visible
    expect(screen.getByText("In Progress")).toBeInTheDocument();

    const inProgressOption = screen.getByRole("checkbox", { name: "In Progress" });
    fireEvent.click(inProgressOption);

    expect(onChange).toHaveBeenCalledWith(["open", "in_progress"]);
  });

  it("allows unselecting an already selected value", () => {
    const onChange = vi.fn();
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={["open", "in_progress"]}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole("button", { name: "Filter by Status" });
    fireEvent.click(trigger);

    const openOption = screen.getByRole("checkbox", { name: "Open" });
    fireEvent.click(openOption);

    expect(onChange).toHaveBeenCalledWith(["in_progress"]);
  });

  it("filters options via search input", () => {
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={[]}
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter by Status" }));

    const searchInput = screen.getByPlaceholderText("Search Status...");
    fireEvent.change(searchInput, { target: { value: "prog" } });

    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.queryByText("Resolved")).not.toBeInTheDocument();
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  it("clears all selected options when clear button is clicked", () => {
    const onChange = vi.fn();
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={["open", "resolved"]}
        onChange={onChange}
      />
    );

    const clearButton = screen.getByRole("button", { name: "Clear Status filters" });
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("renders active removable tags when showBadges is true", () => {
    const onChange = vi.fn();
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={["open", "resolved"]}
        onChange={onChange}
        showBadges={true}
      />
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();

    const removeOpenBadge = screen.getByRole("button", { name: "Remove Open filter" });
    fireEvent.click(removeOpenBadge);

    expect(onChange).toHaveBeenCalledWith(["resolved"]);
  });

  it("supports singleSelect mode by selecting only one value and closing dropdown", () => {
    const onChange = vi.fn();
    render(
      <ComboboxFilter
        label="Status"
        options={sampleOptions}
        selectedValues={["open"]}
        onChange={onChange}
        singleSelect={true}
      />
    );

    const trigger = screen.getByRole("button", { name: "Filter by Status" });
    fireEvent.click(trigger);

    const inProgressOption = screen.getByRole("checkbox", { name: "In Progress" });
    fireEvent.click(inProgressOption);

    expect(onChange).toHaveBeenCalledWith(["in_progress"]);
  });
});
