import AdminButton from '../components/ui/admin-button';
import Textbox from '../components/ui/admin-textbox';

export default function Page() {
  return (
    <main style={{backgroundColor:"var(--color-bg)" ,color:"var(--color-text)"}} className="min-h-screen flex items-center justify-center">
      <form action="#" method="post" className='shadow-md rounded-xl w-2/7 m-auto py-8 flex flex-col' style={{ border: "1px solid var(--color-input-bg)" }}>

        <h1 className='text-center'>ログイン</h1>

        <label className='block w-3/4 mx-auto text-left'>メールアドレス</label>{/*text-center */}
        <div className='text-center mb-4'>
          <Textbox name="title" placeholder="メールアドレスを入力してください" className=''/>{/*m-auto */}
        </div>

        <label className='block w-3/4 mx-auto text-left'>パスワード</label>{/*text-center */}
        <div className='text-center mb-2'>
          <Textbox name="title" placeholder="パスワードを入力してください" className=''/>{/*m-auto */}
        </div>

        <a href="#" className='text-center mb-2'>パスワードを忘れた場合</a>

        <div className='text-center'>
          <AdminButton label="ログイン" type="submit" className='' />{/*m-auto */}
        </div>
      </form>
    </main>
  );
}
