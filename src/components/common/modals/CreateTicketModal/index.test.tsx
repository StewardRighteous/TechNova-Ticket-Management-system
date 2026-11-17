import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { CreateTicketModal } from "./index";
import { useTicketStore } from "../../../../store/barrel";

describe("CreateTicketModal 2-Step Intake Flow", () => {
  beforeEach(() => {
    useTicketStore.getState().resetDemoData();
    useTicketStore.getState().setIsCreateModalOpen(true);
  });

  it("Step 1 selects Intake Channel and provides customer autocomplete", async () => {
    render(<CreateTicketModal />);

    expect(screen.getByText(/create new support ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1: channel & customer/i)).toBeInTheDocument();

    // Select channel (WhatsApp, Email, Phone)
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();

    // Customer autocomplete search input exists
    const customerInput = screen.getByPlaceholderText(/search client or company/i);
    expect(customerInput).toBeInTheDocument();

    // Fill customer search
    fireEvent.change(customerInput, { target: { value: "Apex" } });
    await waitFor(() => {
      expect(screen.getByText(/Apex Financial Services/i)).toBeInTheDocument();
    });
  });

  it("Step 2 displays dynamic diagnostic fields tailored to chosen category", async () => {
    render(<CreateTicketModal />);

    // In step 1, provide title and advance
    const titleInput = screen.getByPlaceholderText(/ticket title/i);
    fireEvent.change(titleInput, { target: { value: "API failure incident" } });

    // Click Next Step
    const nextBtn = screen.getByText(/next: diagnostic details/i);
    fireEvent.click(nextBtn);

    // Now in Step 2: Diagnostic & Details
    expect(screen.getByText(/step 2: category & diagnostics/i)).toBeInTheDocument();

    // Select Category "Technical/Bug"
    const categorySelect = screen.getByLabelText(/incident category/i);
    fireEvent.change(categorySelect, { target: { value: "Technical/Bug" } });

    // Technical/Bug shows diagnostic fields: error code / message / steps
    expect(screen.getByLabelText(/error message or code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/steps to reproduce/i)).toBeInTheDocument();

    // Change category to "Billing"
    fireEvent.change(categorySelect, { target: { value: "Billing" } });
    expect(screen.getByLabelText(/invoice or transaction id/i)).toBeInTheDocument();

    // Change category to "Login"
    fireEvent.change(categorySelect, { target: { value: "Login" } });
    expect(screen.getByLabelText(/affected account or username/i)).toBeInTheDocument();
  });

  it("submitting a ticket saves it with unique ID, persists to store, and triggers success toast", async () => {
    render(<CreateTicketModal />);

    const titleInput = screen.getByPlaceholderText(/ticket title/i);
    fireEvent.change(titleInput, { target: { value: "Payment Webhook Timeout" } });

    // Advance to Step 2
    fireEvent.click(screen.getByText(/next: diagnostic details/i));

    // Fill Problem Description
    const descInput = screen.getByLabelText(/problem description/i);
    fireEvent.change(descInput, {
      target: { value: "Webhooks return HTTP 504 on endpoint sync" },
    });

    // Submit
    const submitBtn = screen.getByText(/dispatch ticket/i);
    fireEvent.click(submitBtn);

    // Verify modal closes
    expect(useTicketStore.getState().isCreateModalOpen).toBe(false);

    // Verify ticket added to store
    const tickets = useTicketStore.getState().data.tickets;
    const addedTicket = tickets.find((t) => t.title === "Payment Webhook Timeout");
    expect(addedTicket).toBeDefined();
    expect(addedTicket?.id).toMatch(/^TCK-/);

    // Verify toast is triggered
    const toasts = useTicketStore.getState().toasts;
    expect(toasts.some((t) => t.type === "success" && t.message.includes("created"))).toBe(true);
  });
});
