interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <nav aria-label="Form progress">
      <ol className="mx-auto flex max-w-xl">
        {steps.map((label, index) => {
          const complete = index + 1 < currentStep;
          const current = index + 1 === currentStep;
          return (
            <li key={label} aria-current={current ? "step" : undefined} className="relative flex flex-1 flex-col items-center text-center">
              {index > 0 && <span aria-hidden="true" className={`absolute top-4 right-1/2 h-0.5 w-full ${current || complete ? "bg-emerald-500" : "bg-slate-300"}`} />}
              <span className={`relative z-10 flex size-8 items-center justify-center rounded-full border text-sm font-bold ${current ? "border-brand-indigo bg-brand-indigo text-white" : complete ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400 bg-white text-slate-500"}`}>
                {complete ? "✓" : index + 1}
              </span>
              <span className={`mt-1.5 text-sm font-semibold ${current ? "text-brand-indigo" : complete ? "text-emerald-800" : "text-slate-500"}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
