"use client";

import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  href?: string;
}

export function Button({
  children,
  className = "",
  backgroundColor,
  style,
  href,
  ...props
}: ButtonProps) {
  const baseClasses = `
        w-full rounded-lg px-6 py-4 text-white font-bold text-lg shadow-lg transition-opacity hover:opacity-90 inline-flex items-center justify-center
        ${!backgroundColor ? "bg-rose-500" : ""}
        ${className}
      `;

  const baseStyle = {
    backgroundColor: backgroundColor,
    ...style,
  };

  if (href) {
    return (
      <Link href={href} className={baseClasses} style={baseStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} style={baseStyle} {...props}>
      {children}
    </button>
  );
}
