"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import "@/styles/admin/header.css";

export function AdminHeader() {
  const [openMenu, setOpenMenu] = useState(false);
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (!pathname.startsWith("/admin")) return [];

    const labels: Record<string, string> = {
      "/admin": "管理者トップ",
      "/admin/home": "ホーム",
      "/admin/notice": "お知らせ管理",
      "/admin/register-notice": "お知らせ登録",
      "/admin/edit-notice": "お知らせ編集",
      "/admin/detail-notice": "お知らせ詳細",
      "/admin/events": "イベント管理",
      "/admin/events-details": "イベント詳細",
      "/admin/users": "ユーザー管理",
      "/admin/terms": "利用規約管理",
      "/admin/register-term": "利用規約登録",
      "/admin/edit-term": "利用規約編集",
      "/admin/detail-term": "利用規約詳細",
      "/admin/password": "パスワード変更",
      "/admin/password/reset": "パスワード再設定",
      "/admin/password/reset-request": "パスワード再設定申請",
      "/admin/print-preview": "印刷プレビュー",
    };
    const parentByPath: Record<string, string> = {
      "/admin/events-details": "/admin/events",
      "/admin/register-notice": "/admin/notice",
      "/admin/edit-notice": "/admin/notice",
      "/admin/detail-notice": "/admin/notice",
      "/admin/register-term": "/admin/terms",
      "/admin/edit-term": "/admin/terms",
      "/admin/detail-term": "/admin/terms",
      "/admin/password/reset": "/admin/password",
      "/admin/password/reset-request": "/admin/password",
    };

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    const items: { label: string; href: string }[] = [];
    items.push({ label: "管理者トップ", href: "/admin/home" });

    let current = "/admin";
    for (let i = 1; i < segments.length; i += 1) {
      current += `/${segments[i]}`;
      const label = labels[current] ?? segments[i];
      items.push({ label, href: current });
    }

    const parentPath = parentByPath[pathname];
    if (parentPath) {
      const parentLabel = labels[parentPath] ?? parentPath.split("/").pop() ?? "";
      const exists = items.some((item) => item.href === parentPath);
      if (!exists) {
        items.splice(1, 0, { label: parentLabel, href: parentPath });
      }
    }

    return items;
  }, [pathname]);

  const handleMenuToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenMenu((v) => !v);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin" });
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/admin/home"
          className="flex items-center hover:opacity-80 transition-opacity shrink-0"
        >
          ホーム
        </Link>

        <nav
          aria-label="breadcrumb"
          className="flex-1 px-2 hidden sm:block"
        >
          <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${item.href}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span className="text-slate-300">/</span>
                  ) : null}
                  {isLast ? (
                    <span className="font-semibold text-slate-700">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-slate-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-center shrink-0">
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
                  利用規約管理
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
