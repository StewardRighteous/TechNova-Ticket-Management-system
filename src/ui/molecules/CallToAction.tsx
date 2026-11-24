import type { ComponentPropsWithRef } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

export function CallToAction({
  icon,
  children,
  size = "compact",
  ...props
}: ComponentPropsWithRef<typeof Button> & { icon: string }) {
  return (
    <Button type="button" tone="primary" size={size} {...props}>
      <Icon aria-hidden="true" className="text-base">
        {icon}
      </Icon>
      {children}
    </Button>
  );
}
