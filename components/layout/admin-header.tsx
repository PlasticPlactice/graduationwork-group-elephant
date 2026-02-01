"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import "@/styles/admin/header.css";

export function AdminHeader() {
  const [openMenu, setOpenMenu] = useState(false);

  const handleMenuToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenMenu((v) => !v);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/admin/home"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          ホーム
        </Link>

        <div className="flex items-center">
          <button
            onClick={handleMenuToggle}
            aria-label={openMenu ? "Close menu" : "Open menu"}
            className="ml-4 inline-flex h-20 w-20 cursor-pointer items-center justify-center rounded-md bg-white hover:bg-gray-50 focus:outline-none border border-gray-100"
            style={{ backgroundColor: "#ffffff", boxShadow: "none" }}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div
          className={`fixed inset-0 z-[9998] pointer-events-${
            openMenu ? "auto" : "none"
          } ${openMenu ? "block" : "hidden"}`}
          onClick={handleMenuToggle}
        >
          <div className="absolute left-0 top-20 right-0 bottom-0 transition-opacity duration-200 z-[9998]" />
        </div>

        <aside
          className={`fixed right-0 top-0 bottom-0 w-72 max-w-full bg-white shadow-lg border-l border-gray-100 transform transition-transform duration-200 z-[9999] pointer-events-auto overflow-y-auto ${
            openMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end p-4">
            <button
              onClick={handleMenuToggle}
              className="inline-flex h-20 w-20 items-center justify-center rounded-md bg-white hover:bg-gray-50 border border-gray-100"
              aria-label="Close menu"
              style={{ backgroundColor: "#ffffff", boxShadow: "none" }}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="mt-6 px-6">
            <ul className="space-y-6">
              <li>
                <Link
                  href="/admin/notice"
                  onClick={() => setOpenMenu(false)}
                  className="group relative block rounded-md px-4 py-3 text-left text-lg font-bold text-gray-800 hover:opacity-90 focus:outline-none"
                >
                  お知らせ管理
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/events"
                  onClick={() => setOpenMenu(false)}
                  className="group relative block rounded-md px-4 py-3 text-left text-lg font-bold text-gray-800 hover:opacity-90 focus:outline-none"
                >
                  イベント管理
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/users"
                  onClick={() => setOpenMenu(false)}
                  className="group relative block rounded-md px-4 py-3 text-left text-lg font-bold text-gray-800 hover:opacity-90 focus:outline-none"
                >
                  ユーザー管理
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/notice"
                  onClick={() => setOpenMenu(false)}
                  className="group relative block rounded-md px-4 py-3 text-left text-lg font-bold text-gray-800 hover:opacity-90 focus:outline-none"
                >
                  寄贈情報管理
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/password"
                  onClick={() => setOpenMenu(false)}
                  className="group relative block rounded-md px-4 py-3 text-left text-lg font-bold text-gray-800 hover:opacity-90 focus:outline-none"
                >
                  パスワード変更
                </Link>
              </li>

              <li>
                <button onClick={handleLogout} className="logout-btn">
                  <span className="text-lg font-bold logout-text">
                    ログアウト
                  </span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </header>
  );
}
