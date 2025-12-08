"use client";

import Styles from "@/styles/app/account-create.module.css";
import Image from "next/image";

export default function PostConfirmPage() {
  return (
    <div className={`${Styles.posterContainer}`}>
        <p className={`font-bold text-center my-4 ${Styles.text24px}`}>書評確認画面</p>
        <div className={`w-full border rounded-sm px-0.5 py-2 ${Styles.userIdContainer}`}>
            静かに心へ染み込むような物語です。派手な展開や劇的な出来事よりも、登場人物の心の内側で起こる揺れが中心に据えられています。主人公は、自分が他者と同じ場所に立っているはずなのに、どこかだけわずかに色が抜けているような感覚を抱えています。その感覚は痛々しいほど大声で叫ぶものではなく、日々の中に淡く落ちる影のように静かに存在します。言葉は簡潔で読みやすいのに、そこに含まれる思いは容易に言葉にできません。読者は、かつて触れた寂しさや、言えなかった気持ちを思い出し、胸の奥がわずかに熱くなるでしょう。読了後には明快な答えが残るわけではありませんが、「自分の中にも同じ色があった」とそっと気づく余韻が心に残ります。その余韻はすぐに消えてしまうものではなく、ふとした瞬間に思い返され、再び心を静かに揺らす力を持っています。まるで長い旅の途中で拾った小石のように、手の中に残り続け、時折その重さを確かめたくなるような作品です。読み終えたあと、自分自身の過去や人との距離について、言葉にならないままそっと考え続けてしまう、その静かな後味こそがこの物語の醍醐味だと感じられます。
        </div>
        <div>
            <p className={`font-bold mt-5`}>本の見た目</p>
            <div className="flex justify-evenly">
                <div>
                    <p className={`text-center my-3 ${Styles.subColor}`}>選択前</p>
                    <Image src="/app/book-bubble.png" alt="水玉" width={106} height={164} />
                </div>
                <div className={`border-r`}></div>
                <div className="">
                    <p className={`text-center my-3 ${Styles.subColor}`}>本棚</p>
                    <Image src="/app/bubble-back.png" alt="水玉" width={34} height={164} />
                </div>
            </div>

            <button className={`w-full mt-10`}>登録</button>
            <button className={`w-full my-5 ${Styles.barcodeScan__backButton}`}>編集に戻る</button>
        </div>
    </div>
  );
}
