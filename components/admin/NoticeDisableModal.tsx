"use client"
import AdminButton from '@/components/ui/admin-button';

interface CsvOutputModalPops {
    isOpen: boolean;
    onClose: () => void;
}

export default function CsvOutputModal({ isOpen, onClose }: CsvOutputModalPops) {
    if (!isOpen) return null;


    
    return (
        <div className="fixed inset-0 notice-disable-modal bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="modal-content bg-white rounded-lg w-5/12 max-w-8xl max-h-[90vh] flex flex-col p-6"  onClick={(e) => e.stopPropagation()}>
                <p className='text-center font-bold text-xl mb-3'>本当に非公開にしますか？</p>
                <div className='flex justify-center gap-20'>
                    <button className='back-btn modal-btn-common'>戻る</button>
                    <button className='disable-btn modal-btn-common'>非公開にする</button>
                </div>
            </div>
        </div>
    )
}
