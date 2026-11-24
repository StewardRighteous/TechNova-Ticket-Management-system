import type { ReactNode } from "react";
import { Button } from "../atoms/Button";

interface StepActionProps {
  onContinue?: () => void;
  continueLabel?: string;
  submitLabel: string;
  submitDisabled?: boolean;
}

export function StepAction({ onContinue, continueLabel = "Continue", submitLabel, submitDisabled }: StepActionProps) {
  if (onContinue) return (
    <Button key="continue" tone="primary" type="button" onClick={(event) => {
      // A step transition can render the submit button before the click's default action.
      event.preventDefault();
      onContinue();
    }}>
      {continueLabel} <span aria-hidden="true">→</span>
    </Button>
  );

  return <Button key="submit" tone="primary" type="submit" disabled={submitDisabled}>{submitLabel}</Button>;
}

export function FormActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <footer className={`flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 ${className}`}>
      {children}
    </footer>
  );
}
