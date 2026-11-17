import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LoginPage } from "./LoginPage";
import { useTicketStore } from "../../store/barrel";

describe("LoginPage demo entry", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useTicketStore.getState().logout();
  });

  it("offers full-name personas with role descriptions and explains the email-only demo", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Choose a demo persona" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Arthur Pendelton.*Operations Manager/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Samira Noor.*Support Agent/ })).toBeInTheDocument();
    expect(screen.getByText(/No password or real sign-in is used/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("opens the selected persona and remembers it for the current session", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Samira Noor.*Support Agent/ }));

    expect(useTicketStore.getState().currentUser?.name).toBe("Samira Noor");
    expect(useTicketStore.getState().activeRole).toBe("support_agent");
    expect(sessionStorage.getItem("technova_demo_persona")).toBe(useTicketStore.getState().currentUser?.id);
  });
});
