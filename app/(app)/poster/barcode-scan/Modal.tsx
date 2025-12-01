"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import Styles from "@/styles/app/modal.module.css"

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({open, onClose, children}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if(!open || !mounted) return null;

    return createPortal(
        <div className={`${Styles.modalOverlay}`} onClick={onClose}>
            <div className={`${Styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
        , document.body
    );
}
