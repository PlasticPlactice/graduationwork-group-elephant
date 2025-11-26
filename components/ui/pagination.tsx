"use client";

import React from "react";
import "@/styles/components/pagination.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export const Pagination = ({
  currentPage = 1,
  totalPages = 5,
}: PaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn pagination-arrow"
        aria-label="前へ"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span>&lt;</span>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-btn pagination-number ${
            page === currentPage ? "active" : ""
          }`}
          onClick={() => handlePageChange(page)}
          aria-label={`ページ ${page}へ`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn pagination-arrow"
        aria-label="次へ"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span>&gt;</span>
      </button>
    </div>
  );
};
