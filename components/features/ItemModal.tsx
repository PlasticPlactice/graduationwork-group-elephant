"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import "@/styles/components/ItemModal.css";

interface ItemProps {
  id: number;
  date: string;
  title: string;
  image: string;
  content?: string;
  pdfUrl?: string;
}

interface ItemModalProps {
  item: ItemProps;
  onClose: () => void;
}

export const ItemModal = ({ item, onClose }: ItemModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // 背景クリックでモーダルを閉じるが、コンテンツ内クリックでは閉じないようにする
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="閉じる"
        >
          &times;
        </button>
        <div className="modal-main-image-wrapper">
          <Image
            src={item.image}
            alt={item.title}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="modal-body">
          <p className="modal-date">{item.date}</p>
          <h2 className="modal-title" id="modal-title">
            {item.title}
          </h2>
          <p className="modal-text" style={{ whiteSpace: "pre-wrap" }}>
            {item.content}
          </p>

          {item.pdfUrl && (
            <>
              <h3 className="attachments-title">添付資料</h3>
              <div className="attachments-grid">
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-item"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--color-main)",
                    border: "1px solid #e5e7eb",
                    minHeight: "100px",
                  }}
                >
                  <span className="text-xs font-bold">PDF資料を表示</span>
                </a>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <Button
            onClick={onClose}
            className="modal-footer-close-btn"
            style={{
              backgroundColor: "var(--color-main)",
              color: "var(--color-bg)",
            }}
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
};
