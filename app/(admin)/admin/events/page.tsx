"use client"
import AdminButton from '@/components/ui/admin-button';
import { useRouter } from 'next/navigation';
import "@/styles/admin/events.css"
import { Icon } from "@iconify/react";

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

                <p className='now-event-condition my-5'>現在のイベント状況</p>
                <Icon icon="bxs:up-arrow" rotate={2} className='up-arrow'></Icon>
                <div className='flex justify-between w-2/3 m-auto'>
                    <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                    <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-now'></Icon></p>
                    <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-future'></Icon></p>
                    <p className='w-10'><Icon icon='material-symbols:circle' className='event-condition-circle-future'></Icon></p>
                </div>
                <div className='flex justify-center mt-2'>
                    <progress max={100} value={30} className='w-full h-0.5'></progress>
                </div>
                <div className='flex justify-between w-2/3 m-auto'>
                    <span>開催前</span>
                    <span>一次審査</span>
                    <span>二次審査</span>
                    <span>終了済</span>
                </div>
            </section>
        </main>
    )
}
