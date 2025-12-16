"use client"
import "@/styles/admin/print-preview.css"
import { useEffect } from "react"

export default function Page() {
    
    const handlePrint = () => {
        window.print();
    }

    useEffect(() => {
        const buttons = document.querySelectorAll(".color-btn");

       const handleColorBtnClick = function (this: Element, event: Event) {
            // すべてのボタンから選択状態を外す
            buttons.forEach(b => b.classList.remove("selected"));
            // 押したボタンだけ選択
            this.classList.add("selected");
        };
        buttons.forEach(btn => {
            btn.addEventListener("click", handleColorBtnClick);
        });
        // クリーンアップ
        return () => {
            buttons.forEach(btn => {
                btn.removeEventListener("click", handleColorBtnClick);
            });
        };
    }, []);

    return (
        <main className="flex">
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

            <div className="design-area w-full px-4 py-6">
                <h2 className="design-head font-bold mb-3">デザイン情報</h2>

                <h3 className="design-sub-head font-bold">メインカラー</h3>
                <div className="flex items-center gap-1 mb-4">
                    <p className="main-color-pick rounded-full"></p>
                    <p className="main-color-text">オレンジ</p>
                </div>

                <h3 className="design-sub-head font-bold">柄</h3>
                <div className="flex items-center gap-1 mb-4">
                    <p className="pattern-pick rounded-full"></p>
                    <p className="main-color-text">ストライプ</p>
                </div>

                <h3 className="design-sub-head font-bold">柄のカラー</h3>
                <div className="flex items-center gap-1 mb-6">
                    <p className="pattern-color-pick rounded-full"></p>
                    <p className="main-color-text">ホワイト</p>
                </div>

                <h3 className="design-sub-head font-bold">フォントカラー</h3>
                <div className="flex items-center gap-1 mb-4">
                    <p className="font-color-text">現在:</p>
                    <p className="pattern-color-pick rounded-full"></p>
                </div>

                <div>
                    <p className="font-color-text">編集:</p>
                    <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((row, rowIndex) =>
                            Array.from({ length: rowIndex === 3 ? 2 : 4 }).map((col, colIndex) => {
                                const id = `btn-${rowIndex + 1}-${colIndex + 1}`;
                                // The first button is selected by default
                                const isSelected = rowIndex === 0 && colIndex === 0;
                                return (
                                    <button
                                        key={id}
                                        className={`color-btn rounded-full${isSelected ? " selected" : ""}`}
                                        id={id}
                                    ></button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex justify-center m-auto">
                    <button className="applicable-btn">適用</button>
                </div>
            </div>
        </main>
    )
}
