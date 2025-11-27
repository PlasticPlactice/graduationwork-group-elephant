import type { Metadata } from "next";
import AdminButton from '@/components/ui/admin-button';
import Textbox from '@/components/ui/admin-textbox';
import '@/styles/admin/index.css';

export const metadata: Metadata = {
  title: "ログイン", 
};

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center login-main">
      <form action="#" method="post" className='shadow-md rounded-xl w-2/7 m-auto py-8 flex flex-col login-form'>

        <h1 className='text-center'>ログイン</h1>

        <label className='block w-3/4 mx-auto text-left'>メールアドレス</label>
        <div className='text-center mb-4'>
          <Textbox name="title" placeholder="メールアドレスを入力してください" className=''/>
        </div>

        <label className='block w-3/4 mx-auto text-left'>パスワード</label>
        <div className='text-center mb-2'>
          <Textbox name="title" placeholder="パスワードを入力してください" className=''/>
        </div>

        <a href="#" className='text-center mb-2'>パスワードを忘れた場合</a>

        <div className='text-center'>
          <AdminButton label="ログイン" type="submit" className='login-button' />
        </div>
      </form>
    </main>
  );
}
