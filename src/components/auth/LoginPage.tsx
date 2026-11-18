import React, { useState } from "react";
import { useTicketStore } from "../../store/barrel";
import { DemoPersonaGrid } from "./DemoPersonaGrid";
import initialData from "../../../mockup.json";

const initialDemoEmployeeIds = new Set(
  initialData.employees.map((employee) => employee.id),
);
const defaultDemoEmail =
  initialData.employees.find((employee) => employee.name === "Arthur Pendelton")
    ?.email ?? "";
const defaultDemoPassword = "demo123";

export const LoginPage: React.FC = () => {
  const { data, login, loginAsEmployee } = useTicketStore();
  const [email, setEmail] = useState(defaultDemoEmail);
  const [password, setPassword] = useState(defaultDemoPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "roles">("signin");
  const [supportModal, setSupportModal] = useState<"help" | "contact" | null>(
    null,
  );
  const demoEmployees = data.employees.filter((employee) =>
    initialDemoEmployeeIds.has(employee.id),
  );
  const defaultEmployee =
    demoEmployees.find(
      (employee) =>
        data.roles.find((role) => role.id === employee.role)?.name ===
        "Operations Manager",
    ) ?? demoEmployees[0];
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >(defaultEmployee?.id);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login(email))
      setError(
        "No sample account matches that email. Choose a demo persona or enter a registered sample email.",
      );
  };

  return (
    <main className="login-shell flex min-h-screen items-center justify-center p-4">
      <div className="login-card w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <header className="mb-6 flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f2041] text-white">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[27px]"
            >
              confirmation_number
            </span>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#1f2041] sm:text-[27px]">
            TechNova Solutions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Access your ticket management workspace.
          </p>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex min-h-[42px] items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${mode === "signin" ? "border-[#1f2041] bg-[#1f2041] text-white shadow-sm" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            <span className="material-symbols-outlined text-[19px]">
              person
            </span>
            <span>Sign in</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("roles")}
            className={`flex min-h-[42px] items-center justify-center gap-2 rounded-lg border px-3 text-sm transition ${mode === "roles" ? "border-[#1f2041] bg-[#1f2041] text-white shadow-sm" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            <span className="material-symbols-outlined text-[19px]">bolt</span>
            <span className="font-semibold">Instant Sign In</span>
          </button>
        </div>

        {mode === "signin" ? (
          <>
            <h2 className="mb-4 text-center text-[23px] font-bold tracking-tight text-[#1f2041]">
              Sign in
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="demo-email"
                  className="mb-1 block text-sm font-medium text-slate-800"
                >
                  Username
                </label>
                <input
                  id="demo-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
             
              </div>
              <div>
                <label
                  htmlFor="demo-password"
                  className="mb-1 block text-sm font-medium text-slate-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="demo-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="keep-signed-in" className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input id="keep-signed-in" type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[#102345] focus:ring-2 focus:ring-indigo-200" />
                  Keep me signed in
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "This demo password is prefilled for convenience. Sign-in checks the sample email; passwords are not validated.",
                    )
                  }
                  className="text-right text-sm text-slate-600 hover:text-[#102345]"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-lg bg-[#102345] py-3 font-semibold text-white shadow-sm transition hover:bg-[#18345f]"
              >
                Sign in
              </button>
             
            </form>
            <footer className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setSupportModal("help")}
                className="hover:text-[#102345]"
              >
                Help
              </button>
              <button
                type="button"
                onClick={() => setSupportModal("contact")}
                className="hover:text-[#102345]"
              >
                Contact support
              </button>
            </footer>
          </>
        ) : (
          <>
            <DemoPersonaGrid
              employees={demoEmployees}
              roles={data.roles}
              selectedEmployeeId={selectedEmployeeId}
              onSelectPersona={setSelectedEmployeeId}
              onContinue={() =>
                selectedEmployeeId && loginAsEmployee(selectedEmployeeId)
              }
              heading="Choose a demo role"
            />
            <div className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-500">
              <span className="h-px flex-1 bg-slate-300" />
              <span
                className="group relative inline-flex"
                tabIndex={0}
                aria-label="Demo data information"
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined cursor-help text-[18px]"
                >
                  info
                </span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs leading-5 font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                >
                  This workspace uses mockup and demo data for preview purposes.
                  Records and activity are not real.
                </span>
              </span>
              Demo access only
              <span className="h-px flex-1 bg-slate-300" />
            </div>
          </>
        )}
      </div>
      {supportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSupportModal(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="support-modal-title"
                  className="text-lg font-bold text-[#102345]"
                >
                  {supportModal === "help" ? "Sign-in help" : "Contact support"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {supportModal === "help"
                    ? "This is a demo workspace. Choose Instant roles to enter with a sample profile, or use a registered sample email. Password sign-in is not enabled."
                    : "For this demo, support is handled locally. Include the sample profile you selected and a short description of the issue when sharing feedback with your project team."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportModal(null)}
                aria-label="Close dialog"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSupportModal(null)}
              className="mt-5 w-full rounded-lg bg-[#102345] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#18345f]"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </main>
  );
};
