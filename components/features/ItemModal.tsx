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
  attachments?: { name: string; url: string }[];
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
          <div
            className="modal-text"
            dangerouslySetInnerHTML={{ __html: item.content || "" }}
          />

          {item.attachments && item.attachments.length > 1 && (
            <>
              <h3 className="attachments-title">添付資料</h3>
              <div
                className="attachments-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {item.attachments.slice(1).map((file, index) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.url);
                  return (
                    <a
                      key={index}
                      href={file.url}
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
                      {isImage ? (
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "60px",
                          }}
                        >
                          <Image
                            src={file.url}
                            alt={file.name}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          style={{
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                      )}
                    </a>
                  );
                })}
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
