import { createPortal } from "react-dom";
import { useEffect } from "react";

import Styles from "@/styles/app/modal.module.css";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (typeof document === "undefined" || !open) return null;

  const portalTarget = document.body;

  return createPortal(
    <div
      className={`${Styles.modalOverlay}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${Styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalTarget
  );
}
