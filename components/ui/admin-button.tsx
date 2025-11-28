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
      className={`${sizeClass} rounded text-white flex items-center justify-center gap-2 admin-button ${className}`}
      style={{
        ['--btn-bg' as string]: color,
        ...style
      }}
      {...props}
    >
      <style jsx>{`
          .admin-button{
            background-color:var(--btn-bg, var(--color-main));
            color:var(--color-bg);
          }
          .admin-button:hover {
            /* ホバー時の色（例：背景を白、文字をメイン色にする） */
            background-color: var(--color-bg);
            color: var(--color-main);
            border: 1px solid var(--color-main); /* 枠線をつけてみる */
          }
        `}</style>
      {icon && iconPosition === 'left' && <Icon icon={icon} />}
      {label}
      {icon && iconPosition === 'right' && <Icon icon={icon} />}
    </button>
  );
}
