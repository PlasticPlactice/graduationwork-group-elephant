// components/admin-button.tsx
"use client";
import React from "react";
import { Icon } from '@iconify/react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: string; // アイコン名を受け取る
  iconPosition?: 'left' | 'right'; // アイコンの位置
};

export default function Button({
  label,
  color = 'var(--color-main)',
  size = 'lg',
  type = "button",
  icon,
  iconPosition = 'left',
  className = "",
  style = {},
  ...props
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
      className={`${sizeClass} rounded text-white flex items-center justify-center gap-2 ${className}`}
      style={{
        backgroundColor: color,
        ...style
      }}
      {...props}
      
    >
      {icon && iconPosition === 'left' && <Icon icon={icon} />}
      {label}
      {icon && iconPosition === 'right' && <Icon icon={icon} />}
    </button>
  );
}
