import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastNotificationContainer } from "./ToastNotificationContainer";
import { useTicketStore } from "../../store";

describe("ToastNotificationContainer", () => {
  beforeEach(() => {
    useTicketStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders toast messages and dismisses when close button is clicked", () => {
    render(<ToastNotificationContainer />);

    act(() => {
      useTicketStore.getState().addToast("Test notice message", "info");
    });

    expect(screen.getByText("Test notice message")).toBeInTheDocument();

    const dismissButton = screen.getByLabelText("Dismiss toast");
    fireEvent.click(dismissButton);

    expect(screen.queryByText("Test notice message")).not.toBeInTheDocument();
  });

  it("auto-dismisses toasts after duration", () => {
    render(<ToastNotificationContainer />);

    act(() => {
      useTicketStore.getState().addToast("Auto dismiss message", "success", 3000);
    });

    expect(screen.getByText("Auto dismiss message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.queryByText("Auto dismiss message")).not.toBeInTheDocument();
  });
});
