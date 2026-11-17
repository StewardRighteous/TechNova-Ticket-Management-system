import { describe, it, expect, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Header } from "./index";
import { ToastNotificationContainer } from "../../ToastNotificationContainer/index";
import { useTicketStore } from "../../../../store/barrel";
import { MemoryRouter } from "react-router-dom";

describe("Header & Persona Switcher Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    useTicketStore.getState().resetDemoData();
  });

  it("shows the active persona in the profile and switches roles through store state", () => {
    render(
      <MemoryRouter><>
        <Header />
        <ToastNotificationContainer />
      </></MemoryRouter>
    );

    expect(screen.getByText("Operations Manager")).toBeInTheDocument();
    act(() => useTicketStore.getState().setActivePersona("support_agent"));

    expect(useTicketStore.getState().activeRole).toBe("support_agent");
    expect(screen.getByText("Samira Noor")).toBeInTheDocument();
  });

  it("does not expose demo reset in the global header", () => {
    render(
      <MemoryRouter><>
        <Header />
        <ToastNotificationContainer />
      </></MemoryRouter>
    );

    expect(screen.queryByTitle("Reset Demo Data")).not.toBeInTheDocument();
  });

  it("makes persona switching discoverable in the profile menu", () => {
    render(
      <MemoryRouter><Header /></MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch demo persona" }));
    fireEvent.click(screen.getByRole("button", { name: /Samira Noor.*Support Agent/ }));

    expect(useTicketStore.getState().currentUser?.name).toBe("Samira Noor");
    expect(sessionStorage.getItem("technova_demo_persona")).toBe(useTicketStore.getState().currentUser?.id);
  });
});
