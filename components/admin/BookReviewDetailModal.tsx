"use client"
import { Icon } from "@iconify/react";
import "@/styles/admin/events.css"

interface BookReviewDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookReviewDetailModal({ isOpen, onClose }: BookReviewDetailModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 review-modal flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
                className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">書評詳細・編集</h2>
                    <button onClick={onClose} className="close-btn text-black">
                        <Icon icon="mdi:close" width={24} className='text-black'/>
                    </button>
                </div>
            </div>
        </div>
    )
}
