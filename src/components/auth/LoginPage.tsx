import React, { useState } from "react";
import { useTicketStore } from "../../store/barrel";

export const LoginPage: React.FC = () => {
  const { login } = useTicketStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [supportModal, setSupportModal] = useState<"help" | "contact" | null>(
    null,
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!login(email, password)) setError("Invalid email or password.");
  };

  return (
    <main className="login-shell min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#1d1e49] px-4 py-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10 max-w-md pl-10">
            <div className="flex items-center gap-4">
              <img
                src="/technova-logo.svg"
                alt="TechNova Solutions Pvt. Ltd."
                className="h-auto w-full max-w-[330px]"
              />
            </div>
            <div className="mt-20 h-1.5 w-28 rounded-full bg-[#ffc23b]" />
            <h2 className="mt-7 text-5xl leading-[1.08] font-bold tracking-tight">
              Ticket Management System
            </h2>
            <p className="mt-8 max-w-sm text-xl leading-9 text-slate-200">
              Manage IT support requests and workplace services for TechNova
              employees.
            </p>
          </div>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-[560px]">
            <header>
              <h1 className="text-3xl font-bold tracking-tight text-[#111536] sm:text-4xl">
                Employee Sign In
              </h1>
              <p className="mt-3 text-lg text-slate-600 sm:text-xl">
                Access the TechNova Ticket Management System
              </p>
            </header>
            <form onSubmit={submit} className="mt-8 space-y-5">
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
                  className="mb-1.5 block text-sm font-bold text-[#111536]"
                >
                  Work email
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-slate-600"
                  >
                    mail
                  </span>
                  <span className="pointer-events-none absolute top-1/2 left-12 h-8 w-px -translate-y-1/2 bg-slate-300" />
                  <input
                    id="demo-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@technova.example"
                    className="h-12 w-full rounded-lg border-2 border-slate-300 bg-white pl-14 pr-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#10aeb4] focus:ring-4 focus:ring-cyan-100"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="demo-password"
                  className="mb-1.5 block text-sm font-bold text-[#111536]"
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-slate-600"
                  >
                    lock
                  </span>
                  <span className="pointer-events-none absolute top-1/2 left-12 h-8 w-px -translate-y-1/2 bg-slate-300" />
                  <input
                    id="demo-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-lg border-2 border-slate-300 bg-white pl-14 pr-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#10aeb4] focus:ring-4 focus:ring-cyan-100"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute top-1/2 right-3 flex -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-[#10aeb4]"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#08a9af] text-base font-bold text-white shadow-md transition hover:bg-[#078f98] focus-visible:ring-4 focus-visible:ring-cyan-200 focus-visible:outline-none"
              >
                Sign in
              </button>
            </form>
            <button
              type="button"
              onClick={() =>
                setError("Please contact support to reset your password.")
              }
              className="mx-auto mt-6 block text-base font-semibold text-[#63338e] underline decoration-2 underline-offset-4 hover:text-[#111536]"
            >
              Reset password
            </button>
            <p className="mt-8 flex items-center justify-center gap-3 text-base text-slate-600">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                lock
              </span>
              Only internal TechNova employees.
            </p>
            <footer className="mt-6 flex items-center justify-center gap-7 border-t border-slate-200 pt-4 text-sm text-[#3269a8]">
              <button
                type="button"
                onClick={() => setSupportModal("help")}
                className="hover:text-[#111536]"
              >
                Help
              </button>
              <button
                type="button"
                onClick={() => setSupportModal("contact")}
                className="hover:text-[#111536]"
              >
                Contact support
              </button>
            </footer>
          </div>
        </section>
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
                    ? "Enter your registered email address to sign in. If you need help, contact your workspace administrator."
                    : "Contact your workspace administrator with a short description of the issue."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportModal(null)}
                aria-label="Close dialog"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSupportModal(null)}
              className="mt-5 w-full rounded-lg bg-[#102345] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </main>
  );
};
