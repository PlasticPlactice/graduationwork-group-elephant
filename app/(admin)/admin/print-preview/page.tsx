"use client"
import "@/styles/admin/print-preview.css"

export default function Page() {
    
    const handlePrint = () => {
        window.print();
    }

    return (
        <main>
            <div>
                <h2 className="preview-head">プレビュー</h2>
                <section className="print-area">
                    <div className="card-area">
                        <p id="number">No.通し番号</p>
                        <p id="book-review">１ヶ月前、私は会社の先輩の冴子さえこさんと付き合うことになった。
                            前からずっと気になっていた先輩に断れるのを覚悟で呑みに誘った。
                            「美味しいお酒が呑めるなら一緒に呑んでもいいけど」
                            普段あまり笑顔を見せない冴子さんが少し楽しそうに笑みを浮かべているのを見て、私は内心ガッツポーズをした。
                            大分酔いが回って来た頃、私は思いきって冴子さんに
                            「彼氏さんどんな人なんですか？」と探りを入れた。
                            社内でも美人で仕事もできる冴子さんがモテないわけがないのだけど、人づてにフリーらしいと聞いて本当かどうか確かめたかった。「今は一人」「へぇ～意外ですね。私が男なら冴子さんみたいな素敵な人、絶対落としに行きますよ！」「藍田あいだは男じゃないから落としには来ないってこと？」全くもって予想外の返答に私は持っていたグラスを落としそうになった。「…女が落としに行っても冴子さんは落ちてくれるんですか？」平然を装いながら、でも内心では耳元にも聞こえるくらいに心臓がドキドキしていた。「男とか女とかそんな些末なこと、どうでもいいでしょ」当たり前のことを聞くなと言わんばかりの態度に私は思いきって</p>
                        <div id="reviewer-section">
                            <p>〇代男性　象花たろう</p>
                            <p id="reviewer-introduction">本大好きです。書評は書いたことがありませんが、
                                いろんな方々に好きな本をひろめられるようにかんばります。
                            </p>
                        </div>
                    </div>
                </section>
                <div className="flex justify-center m-auto">
                    <button id="print-btn" className="" onClick={handlePrint}>印刷</button>
                </div>
            </div>

            {/* <div>
                <h2>デザイン情報</h2>
                <h3>メインカラー</h3>
                <p></p>
                オレンジ
            </div> */}
        </main>
    )
}
