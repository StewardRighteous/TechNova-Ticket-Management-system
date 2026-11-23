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
      <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
        <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-brand-indigo px-6 py-5 text-white lg:px-12 lg:py-10 xl:px-16">
          <img src="/login-atrium.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-brand-indigo/95 via-brand-indigo/70 via-45% to-brand-indigo/45" />
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            </span>
            <span className="text-xl font-bold tracking-tight">TechNova</span>
          </div>
          <div className="hidden max-w-lg lg:block">
            <h2 className="text-5xl leading-[1.04] font-bold tracking-[-0.045em] xl:text-6xl">Ticket Management System</h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white">Manage IT support requests and workplace services for TechNova employees.</p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-[420px]">
            <header>
              <h1 className="text-3xl font-bold tracking-tight text-[#111536] sm:text-4xl">
                Employee sign in
              </h1>
              <p className="mt-2 text-base text-slate-600">
                Sign in with your work account.
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
                  <input
                    id="demo-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@technova.example"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-12 pr-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#10aeb4] focus:ring-4 focus:ring-cyan-100"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <label htmlFor="demo-password" className="text-sm font-bold text-[#111536]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setError("Please contact support to reset your password.")
                    }
                    className="text-xs font-semibold text-indigo-700 hover:underline"
                  >
                    Reset password
                  </button>
                </div>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-slate-600"
                  >
                    lock
                  </span>
                  <input
                    id="demo-password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-12 pr-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#10aeb4] focus:ring-4 focus:ring-cyan-100"
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#116b72] text-base font-bold text-white shadow-md transition hover:bg-[#10565e] focus-visible:ring-4 focus-visible:ring-cyan-200 focus-visible:outline-none"
              >
                Sign in <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>
            <p className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                lock
              </span>
              For TechNova employees only.
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
