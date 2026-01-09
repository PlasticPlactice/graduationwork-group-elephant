import "@/styles/admin/users.css"
import { Icon } from "@iconify/react";

interface UserExitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserDetailModal({ isOpen, onClose }: UserExitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 user-detail-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">ユーザー詳細</h2>
                    <button onClick={onClose} className="close-btn text-black">
                        <Icon icon="mdi:close" width={24} className='text-black'/>
                    </button>
                </div>
                <div className="user-data-title grid grid-cols-5 px-6 text-center">
                    <p>書評ID</p>
                    <p>ニックネーム</p>
                    <p>ステータス</p>
                    <p>年代</p>
                    <p>居住地</p>
                </div>
                <div className="text-2xl grid grid-cols-5 px-6 text-center font-bold">
                    <p>000000</p>
                    <p>象花たろう</p>
                    <p><span className="status">利用中</span></p>
                    <p>20代</p>
                    <p>岩手県盛岡市</p>
                </div>
            </div>
        </div>
    )
}
