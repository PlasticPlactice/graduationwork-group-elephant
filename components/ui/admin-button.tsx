// components/admin-button.tsx
"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({
  label,
  color = 'var(--color-main)',
  size = 'lg',
  type = "button",
  }: ButtonProps) {
  const sizeClass =
    size === 'sm'
      ? 'px-2 py-1 text-sm'
      : size === 'lg'
      ? 'w-3/4 px-20 py-3 text-xl'
      : 'px-4 py-2 text-base';

  return (
    <button
      type={type}
      className={`${sizeClass} rounded text-white`}
      style={{ backgroundColor: color }}
      
    >
      {label}
    </button>
  );
}
