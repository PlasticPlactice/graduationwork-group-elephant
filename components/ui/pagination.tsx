import React from "react";

export const Pagination = () => {
  return (
    <div className="pagination-container">
      <button className="pagination-btn pagination-arrow" aria-label="前へ">
        <span>&lt;</span>
      </button>

      {[1, 2, 3, 4, 5].map((page) => (
        <button key={page} className="pagination-btn pagination-number">
          {page}
        </button>
      ))}

      <button className="pagination-btn pagination-arrow" aria-label="次へ">
        <span>&gt;</span>
      </button>
    </div>
  );
};
