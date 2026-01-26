"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

interface MessageData {
  id: string;
  message: {
    message: string;
  };
}

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageData, setMessageData] = useState<MessageData | null>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/user/messages/unread");
        if (res.ok) {
          const data = await res.json();
          if (data.unreadMessage) {
            setMessageData(data.unreadMessage);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchUnread();
  }, []);

  const handleClose = async () => {
    if (!messageData) return;
    try {
      // 既読APIをコール
      await fetch(`/api/user/messages/${messageData.id}/read`, {
        method: "PATCH",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // エラーでもとりあえず閉じる（UX優先）
      setIsOpen(false);
    }
  };

  if (!isOpen || !messageData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl relative">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Icon icon="mdi:check" className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">お知らせ</h3>
          <p className="text-sm text-gray-500 whitespace-pre-wrap mb-6">
            {messageData.message.message}
          </p>
          <button
            onClick={handleClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            確認しました
          </button>
        </div>
      </div>
    </div>
  );
}
