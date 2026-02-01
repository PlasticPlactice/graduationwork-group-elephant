//components/admin-textbox.tsx
"use client";
import React from "react";

type TextboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    placeholder?: string;
    border?: string;
    backcolor?: string;
    fontcolor?: string;
    size?: "sm" | "md" | "lg";
};

export default function Textbox({
  placeholder = "",
  border = "1px solid var(--color-input-bg)",
  backcolor = "var(--color-bg)",
  fontcolor = "var(--color-text)",
  size = "lg",
  type = "text",
  className = "",
  style = {},
  ...props
}: TextboxProps) {
    const sizeClass =
      size === 'sm'
       ? 'px-2 py-1 text-sm h-8'
       : size === 'lg'
       ? 'w-3/4 px-5 py-3 text-xl h-14'
       : 'px-4 py-2 text-base h-12';
    
    return (
    <>
        <input
        type={type}
        placeholder={placeholder}
        className={ `${sizeClass} rounded bg-white admin-textbox ${className}`}
          style={{
            border: border,
            backgroundColor: backcolor,
            color: fontcolor,
            ...style
          }}
        {...props}
            />
            <style jsx>{`
          .admin-textbox::placeholder {
            color: rgba(106,140,164,0.5);
            font-size:1rem
          }
        `}</style>
    </>    
  );
}
