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
}

interface ItemModalProps {
  item: ItemProps;
  onClose: () => void;
}

// モーダル用のダミーデータ
const modalContent = {
  text: "このたび、当館では「第一回 文庫X」を開催いたします。\n文庫Xとは、中身のわからない本をテーマにした読書イベントです。\nタイトルや著者名を伏せた状態で本を選び、読んでからのお楽しみ！\n普段出会えない一冊との出会いを、ぜひお楽しみください。",
  eventDate: "開催期間：10月1日～11月30日",
  eventPlace: "開催場所：図書コーナー 特設棚",
  attachments: [
    { type: "image", src: "/top/image1.png" },
    { type: "image", src: "/top/image.png" },
    { type: "image", src: "/top/image1.png" },
    { type: "image", src: "/top/image.png" },
    { type: "image", src: "/top/image.png" },
    { type: "image", src: "/top/image1.png" },
  ],
};

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
          <p className="modal-text">{modalContent.text}</p>
          <p className="modal-text">{modalContent.eventDate}</p>
          <p className="modal-text">{modalContent.eventPlace}</p>

          <h3 className="attachments-title">添付資料</h3>
          <div className="attachments-grid">
            {modalContent.attachments.map((att, index) => (
              <div key={index} className="attachment-item">
                <Image
                  src={att.src}
                  alt={`添付資料 ${index + 1}`}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))}
          </div>
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
