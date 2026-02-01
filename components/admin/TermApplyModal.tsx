// 使わない予定だが一応残しておく
import React, { useState } from "react";
import "@/styles/admin/terms.css";
import AdminButton from "@/components/ui/admin-button";

interface TermApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getNowDatetimeLocal = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
};

export default function TermApplyModal({
    isOpen,
    onClose,
}: TermApplyModalProps) {
    const [mode, setMode] = useState<"datetime" | "immediate">("datetime");
    const [dateTimeValue, setDateTimeValue] = useState<string>("");;
    if (!isOpen) return null;
    return (
        <div
        className="fixed inset-0 term-apply-modal bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
        >
            <div
                className="modal-content bg-white rounded-lg w-5/12 max-w-8xl max-h-[90vh] flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="modal-head text-center">利用規約適用予約</h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        // ここでAPI送信等を実行
                        onClose();
                    }}>
                    <div className="flex justify-center gap-4 mt-6 text-xl">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="apply"
                                id="datetime"
                            checked={mode === "datetime"}
                                onChange={() => setMode("datetime")}/>
                            <label htmlFor="datetime">日時予約</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="apply"
                                id="immediate"
                                checked={mode === "immediate"}
                                onChange={() => {
                                    setMode("immediate");
                                    setDateTimeValue(getNowDatetimeLocal());
                                }}
                            />
                            <label htmlFor="immediate">即時適用</label>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <input
                            type="datetime-local"
                            className="datetime-input"
                            value={dateTimeValue}
                            onChange={(e) => setDateTimeValue(e.target.value)}
                            disabled={mode !== "datetime"}
                        />
                    </div>
                    <div className="flex justify-center">
                        <AdminButton
                            label="予約を確定する"
                            type="submit"
                            className="reservation-btn mt-6 mx-auto"
                            onClick={onClose}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
