import type { HTMLAttributes, ReactNode } from "react";

type TextProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Eyebrow({ className = "", ...props }: TextProps) {
  return <p className={`ds-eyebrow ${className}`.trim()} {...props} />;
}

export function Lead({ className = "", ...props }: TextProps) {
  return <p className={`ds-lead ${className}`.trim()} {...props} />;
}

export function Caption({ className = "", ...props }: TextProps) {
  return <span className={`ds-caption ${className}`.trim()} {...props} />;
}
