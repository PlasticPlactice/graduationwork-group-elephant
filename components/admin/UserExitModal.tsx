import "@/styles/admin/users.css"

interface UserExitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserExitModal({ isOpen, onClose }: UserExitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 reg-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-11/12 max-w-8xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <p>モーダル</p>
            </div>
        </div>
    )
}
