import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowIcon } from "@/components/buttons/ArrowIcon";

type ActionLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "light" | "dark" | "ghost";
  arrow?: boolean;
  className?: string;
};

export function ActionLink({
  children,
  href,
  variant = "primary",
  arrow = true,
  className = "",
}: ActionLinkProps) {
  return (
    <Link
      className={`ds-button ds-button--${variant} ${className}`.trim()}
      href={href}
    >
      {children}
      {arrow && <ArrowIcon />}
    </Link>
  );
}

export function TextLink({
  children,
  href,
  className = "",
}: Omit<ActionLinkProps, "variant" | "arrow">) {
  return (
    <Link className={`ds-text-link ${className}`.trim()} href={href}>
      {children}
      <ArrowIcon />
    </Link>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "light" | "dark" | "ghost";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ds-button ds-button--${variant} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
