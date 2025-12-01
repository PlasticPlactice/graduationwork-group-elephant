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

    useEffect(() => {
	        if (open) {
	            const originalOverflow = document.body.style.overflow;
	            document.body.style.overflow = 'hidden';
	            return () => {
	                document.body.style.overflow = originalOverflow;
	            };
	        }
	}, [open]);

    if(!open || !mounted) return null;

    return createPortal(
        <div className={`${Styles.modalOverlay}`} onClick={onClose} role="dialog" aria-modal="true">
            <div className={`${Styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
        , document.body
    );
}
