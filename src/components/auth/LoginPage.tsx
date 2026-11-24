import { Dialog, Button, Heading, Icon, Input, Label } from "../../ui/barrel";
import React, { useState } from "react";
import { useTicketStore } from "../../store/barrel";

export const LoginPage: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
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
    if (!login(email, password)) {
      setError("Invalid email or password.");
      return;
    }
    onSignedIn();
  };

  return (
    <main className="login-shell min-h-screen bg-white">
      <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
        <aside className="relative isolate flex flex-col justify-between overflow-hidden bg-brand-indigo px-6 py-5 text-white lg:px-12 lg:py-10 xl:px-16">
          <img src="/login-atrium.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-brand-indigo/95 via-brand-indigo/70 via-45% to-brand-indigo/45" />
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-sm">
              <Icon className="text-[20px]">confirmation_number</Icon>
            </span>
            <span className="text-xl font-bold tracking-tight">TechNova</span>
          </div>
          <div className="hidden max-w-lg lg:block">
            <Heading variant="plain" className="text-5xl leading-[1.04] font-bold tracking-[-0.045em] xl:text-6xl">Ticket Management System</Heading>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white">Manage IT support requests and workplace services for TechNova employees.</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-relaxed marker:text-teal-200">
              <li>Report an issue and attach screenshots.</li>
              <li>See who owns a ticket and track its progress.</li>
              <li>Check response and resolution deadlines.</li>
            </ul>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-[420px]">
            <header>
              <Heading as="h1" variant="plain" className="text-3xl font-bold tracking-tight text-[#111536] sm:text-4xl">
                Employee sign in
              </Heading>
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
                <Label variant="plain"
                  htmlFor="demo-email"
                  className="mb-1.5 block text-sm font-bold text-[#111536]"
                >
                  Work email
                </Label>
                <div className="relative">
                  <Icon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-slate-600"
                  >
                    mail
                  </Icon>
                  <Input appearance="plain"
                    id="demo-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="workposition@technova.com"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-12 pr-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#10aeb4] focus:ring-4 focus:ring-cyan-100"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <Label variant="plain" htmlFor="demo-password" className="text-sm font-bold text-[#111536]">
                    Password
                  </Label>
                  <Button tone="plain"
                    type="button"
                    onClick={() =>
                      setError("Please contact support to reset your password.")
                    }
                    className="text-xs font-semibold text-indigo-700 hover:underline"
                  >
                    Reset password
                  </Button>
                </div>
                <div className="relative">
                  <Icon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[22px] text-slate-600"
                  >
                    lock
                  </Icon>
                  <Input appearance="plain"
                    id="demo-password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/60 pl-12 pr-12 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#10aeb4] focus:ring-4 focus:ring-cyan-100"
                  />
                  <Button tone="plain"
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute top-1/2 right-3 flex -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-[#10aeb4]"
                  >
                    <Icon className="text-[22px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </Icon>
                  </Button>
                </div>
              </div>
              <Button tone="plain"
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#116b72] text-base font-bold text-white shadow-md transition hover:bg-[#10565e] focus-visible:ring-4 focus-visible:ring-cyan-200 focus-visible:outline-none"
              >
                Sign in <Icon aria-hidden="true" className="text-lg">arrow_forward</Icon>
              </Button>
            </form>
            <p className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
              <Icon
                aria-hidden="true"
                className="text-[20px]"
              >
                lock
              </Icon>
              For TechNova employees only.
            </p>
            <footer className="mt-6 flex items-center justify-center gap-7 border-t border-slate-200 pt-4 text-sm text-[#3269a8]">
              <Button tone="plain"
                type="button"
                onClick={() => setSupportModal("help")}
                className="hover:text-[#111536]"
              >
                Help
              </Button>
              <Button tone="plain"
                type="button"
                onClick={() => setSupportModal("contact")}
                className="hover:text-[#111536]"
              >
                Contact support
              </Button>
            </footer>
          </div>
        </section>
      </div>

      {supportModal && <Dialog
        title={supportModal === "help" ? "Sign-in help" : "Contact support"}
        description={supportModal === "help"
          ? "Enter your registered email address to sign in. If you need help, contact your workspace administrator."
          : "Contact your workspace administrator with a short description of the issue."}
        onClose={() => setSupportModal(null)}
        showCloseButton
        width="small"
      >
        <div className="px-5 py-4 sm:px-7">
          <Button type="button" tone="primary" className="w-full" onClick={() => setSupportModal(null)}>Got it</Button>
        </div>
      </Dialog>}
    </main>
  );
};
