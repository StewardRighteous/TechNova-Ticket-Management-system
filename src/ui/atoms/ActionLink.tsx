import { Link, type LinkProps } from "react-router-dom";

export function ActionLink({ className = "", ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${className}`}
    />
  );
}
