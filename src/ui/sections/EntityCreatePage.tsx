import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import React from "react";
interface EntityCreatePageProps {
  title: string;
  description: string;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  submitLabel?: string;
}

export const EntityCreatePage: React.FC<EntityCreatePageProps> = ({ title, description, onCancel, onSubmit, children, submitLabel = "Create" }) => {
  return <div className="w-full space-y-3 p-4">
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="border-b border-slate-100 pb-3"><Heading variant="plain" className="text-xl font-bold text-slate-900">{title}</Heading><p className="mt-1 text-sm text-slate-500">{description}</p></header>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      <footer className="flex justify-end gap-3 border-t border-slate-100 pt-3">
        <Button type="button" onClick={onCancel}>Cancel</Button>
        <Button tone="plain" type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">{submitLabel}</Button>
      </footer>
    </form>
  </div>;
};

