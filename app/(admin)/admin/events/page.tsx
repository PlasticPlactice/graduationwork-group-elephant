"use client"
import AdminButton from '@/components/ui/admin-button';
import { useRouter } from 'next/navigation';
import "@/styles/admin/events.css"

export default function Page() {
    const router = useRouter();

    const handleRegister = () => {
        router.push('/admin/home');
    };
    const handledetail = () => {
        router.push('/admin/home')
    }
    return (
        <main>
            <AdminButton
                label="イベント登録" 
                type="button" 
                className='self-end ml-5 my-3 register-btn'
                onClick={handleRegister}
            />
            <h1 className='events-headline text-center'>開催中のイベント</h1>

            <section className='w-11/12 now-event-section m-auto p-4'>
                <div className='flex items-center justify-between pb-3 event-title-section'>
                    <div className='flex items-center'>
                        <AdminButton
                            label='第1回文庫X'
                            className='font-bold event-btn'
                            onClick={handledetail}
                        />
                        <p className='ml-3'>2022-10-01 ~ 2023-10-01</p>
                    </div>
                    <div className='flex items-center mr-10'>
                        <p>イベントの公開</p>
                        <label className="toggle-switch ml-7">
                            <input type="checkbox" id="myToggle"/>
                            
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </section>
        </main>
    )
}
