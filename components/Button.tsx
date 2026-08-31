"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover-glow-purple hover:brightness-110",
  secondary:
    "border border-border bg-transparent text-foreground hover:bg-card hover:border-primary/50",
  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

interface BaseProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps &
  (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }) |
  (BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string });

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const disabled =
    "disabled" in props && props.disabled;
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 ${
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...rest } = props as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
