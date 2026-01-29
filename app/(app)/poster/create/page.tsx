"use client";
import styles from "@/styles/app/poster.module.css";

import Image from "next/image";
import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/app/(app)/Modal";

export default function CreateViewerPage() {
  const [selectedColor, setSelectedColor] = useState("#D1D5DB");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedSubAddress, setSelectedSubAddress] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [introduction, setIntroduction] = useState("よろしくお願いします。");
  const [helpOpen, setHelpOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const router = useRouter();

  const handleAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value;
      setSelectedAddress(newValue);
      if (newValue !== "岩手県") {
        setSelectedSubAddress("");
      }
    },
    []
  );

  const isIwateSelected = useMemo(() => {
    return selectedAddress === "岩手県";
  }, [selectedAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 簡易バリデーション
    if (
      !nickname ||
      !password ||
      !confirmPassword ||
      !selectedAddress ||
      !age ||
      !gender
    ) {
      alert("必須項目を入力してください");
      return;
    }

    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }

    if (isIwateSelected && !selectedSubAddress) {
      alert("岩手県を選択した場合は、市区町村も選択してください");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: nickname,
          password: password,
          address: selectedAddress,
          sub_address: selectedSubAddress,
          age: age,
          gender: gender,
          self_introduction: introduction,
          color: selectedColor,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 登録成功時に完了画面へ遷移 (IDのみクエリパラメータで渡す)
        const params = new URLSearchParams({
          id: data.user.accountId,
        });
        router.push(`/poster/create-complete?${params.toString()}`);
      } else {
        alert(data.message || "登録に失敗しました");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("エラーが発生しました");
    }
  };

  // お気に入りの色の選択用
  const colors = [
    { name: "グレー", value: "#D1D5DB" },
    { name: "イエロー", value: "#FCD34D" },
    { name: "オレンジ", value: "#FF8C42" },
    { name: "ライムグリーン", value: "#BEF264" },
    { name: "グリーン", value: "#34D399" },
    { name: "シアン", value: "#67E8F9" },
    { name: "ピンク", value: "#F9A8D4" },
    { name: "パープル", value: "#A78BFA" },
    { name: "コーラル", value: "#FB7185" },
    { name: "スカイブルー", value: "#93C5FD" },
    { name: "ブルー", value: "#3B82F6" },
    { name: "ブラック", value: "#1F2937" },
  ];

  // 居住地
  const prefectures = [
    "選択してください",
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];

  // 詳細の居住地
  const iwateCities = [
    "盛岡市",
    "宮古市",
    "大船渡市",
    "花巻市",
    "北上市",
    "久慈市",
    "遠野市",
    "一関市",
    "陸前高田市",
    "釜石市",
    "二戸市",
    "八幡平市",
    "奥州市",
    "滝沢市",
    "雫石町",
    "葛巻町",
    "岩手町",
    "紫波町",
    "矢巾町",
    "西和賀町",
    "金ケ崎町",
    "平泉町",
    "住田町",
    "大槌町",
    "山田町",
    "岩泉町",
    "田野畑村",
    "普代村",
    "軽米町",
    "野田村",
    "九戸村",
    "洋野町",
    "一戸町",
  ];

  return (
    <>
      <div className={`${styles.posterContainer}`}>
        <p className={`font-bold text-center mt-12 ${styles.text24px}`}>
          アカウントを作成
        </p>
        <Link
          href="/poster/login"
          className={`block mt-4 text-center font-bold ${styles.linkText}`}
        >
          <span className={`border-b ${styles.linkText}`}>
            既にアカウントをお持ちの方はこちら
          </span>
        </Link>

        <form onSubmit={handleSubmit}>
          {/* ニックネームの入力 */}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/account.png"
                alt="アカウント登録"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="username" className="block font-bold">
                ニックネーム<span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="text"
              name="username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder=""
              className="w-full block "
              required
            />
          </div>

          {/* パスワードの入力 */}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/lock.png"
                alt="パスワード"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="password" className="block font-bold">
                パスワード<span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              className="w-full block "
              required
              minLength={8}
            />
            <p>8文字以上で、英字・数字・記号をそれぞれ1文字以上含めてください</p>
          </div>

          {/* パスワード（確認用）の入力 */}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/lock.png"
                alt="パスワード（確認）"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="confirmPassword" className="block font-bold">
                パスワード（確認用）<span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力してください"
              className="w-full block "
              required
            />
          </div>

          {/* 居住地の選択 */}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/home.png"
                alt="居住地"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="address" className="block font-bold">
                居住地（都道府県）<span className="text-red-500">*</span>
              </label>
            </div>

            <select
              name="address"
              id="address"
              value={selectedAddress}
              onChange={handleAddressChange}
              className={`text-black ${styles.inputSelectForm}`}
              required
            >
              {prefectures.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>

          {/* 詳細の居住地の選択 */}
          <div className={`mb-1 ${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                  src="/app/home.png"
                  alt="居住地"
                  width={24}
                  height={24}
                ></Image>
              <label htmlFor="sub_address" className="block font-bold">
                詳細居住地（市区町村）
              </label>
            </div>

            <select
              name="sub_address"
              id="sub_address"
              value={selectedSubAddress}
              onChange={(e) => setSelectedSubAddress(e.target.value)}
              className={`text-black ${styles.inputSelectForm}`}
              disabled={!isIwateSelected}
            >
              {!isIwateSelected ? (
                <option value="" className={`${styles.subColor}`}>
                  岩手県を選択の方のみ
                </option>
              ) : (
                <>
                  <option value="">選択してください</option>
                  {iwateCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </>
              )}
            </select>
            <p className="text-red-500 font-bold text-small">
              ※居住地で岩手県を選択した人のみ
            </p>
          </div>

          {/* 年齢の選択 */}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/calendar.png"
                alt="居住地"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="old" className="block font-bold">
                年齢<span className="text-red-500"> *</span>
              </label>
            </div>
            <select
              name="old"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`text-black ${styles.inputSelectForm}`}
              required
            >
              <option value="">選択してください</option>
              <option value="10">10代</option>
              <option value="20">20代</option>
              <option value="30">30代</option>
              <option value="40">40代</option>
              <option value="50">50代</option>
              <option value="60">60代</option>
              <option value="70">70代</option>
              <option value="80">80代</option>
              <option value="90">90代</option>
            </select>
          </div>

          {/* 性別選択*/}
          <div
            className={`${styles.labelContainer} ${styles.create__formContainer}`}
          >
            <Image
              src="/app/gender-male.png"
              alt="性別"
              width={24}
              height={24}
            ></Image>
            <label htmlFor="" className="font-bold">
              性別<span className="text-red-500"> *</span>
            </label>
          </div>
          <div className={`ml-2 mb-6 flex gap-8`}>
            <div className="flex gap-3">
              <input
                type="radio"
                id="male"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={(e) => setGender(e.target.value)}
                className={`${styles.genderRadio}`}
              />
              <label htmlFor="male" className="block">
                男性
              </label>
            </div>
            <div className="flex gap-3">
              <input
                type="radio"
                id="female"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={(e) => setGender(e.target.value)}
                className={`${styles.genderRadio}`}
              />
              <label htmlFor="female" className="block">
                女性
              </label>
            </div>
            <div className="flex gap-3">
              <input
                type="radio"
                id="other"
                name="gender"
                value="other"
                checked={gender === "other"}
                onChange={(e) => setGender(e.target.value)}
                className={`${styles.genderRadio}`}
              />
              <label htmlFor="other" className="block">
                その他
              </label>
            </div>
          </div>

          {/* 自己紹介*/}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/message-reply-text.png"
                alt="自己紹介"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="introduction" className="block font-bold">
                自己紹介
              </label>
            </div>
            <textarea
              name="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className={`w-full ${styles.colsIntroduction}`}
            />
          </div>

          {/*カラーを選ぶ*/}
          <div className={`${styles.create__formContainer}`}>
            <label htmlFor="color-select" className="block font-bold">
              あなたのテーマカラー
            </label>
            <p className={`text-small font-bold mb-3 ${styles.subColor}`}>
              テーマカラーは書評が公開された時の本の色になります。
              <br />
              あとで色の変更は可能です。
            </p>
            <div
              className={`grid grid-cols-6 gap-3 justify-between`}
              id="color-select"
            >
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color.value);
                  }}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.name}
                  className={`relative w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 ${styles.colorButton}`}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg ring-2 ring-gray-400"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 利用規約 */}
          <div className="my-12">
            <div
              className={`border w-full rounded-sm px-9 py-9 ${styles.subColor}`}
            >
              <p className="text-center mx-auto  text-red-500 font-bold">
                本サービスご利用のためには、利用規約に同意していただく必要があります。
              </p>

              <button
                type="button"
                className={`w-full my-5 ${styles.barcodeScan__backButton}`}
                onClick={() => setHelpOpen(true)}
              >
                利用規約を読む
              </button>

              <Modal open={helpOpen} onClose={() => setHelpOpen(false)}>
                <p
                  className={`font-bold ${styles.text24px} ${styles.mainColor}`}
                >
                  利用規約
                </p>
                <div
                  className={`border border-b rounded-sm ${styles.mainColor}`}
                ></div>
                <div className="h-96 my-5 overflow-y-scroll">
                  <p className={styles.text14px}>
                    利用規約
                    <br />
                    本利用規約（以下「本規約」といいます。）は、〇〇（以下「当社」といいます。）が提供するサービス「△△」（以下「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に同意いただいた上で本サービスをご利用いただきます。
                    第1条（適用）
                    本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
                    当社は本サービスに関し、本規約のほか、ご利用にあたってのルール、ガイドライン、注意事項等（以下「個別規定」といいます。）を定める場合があります。これら個別規定は本規約の一部を構成するものとします。
                    本規約と個別規定が矛盾する場合、個別規定が優先されるものとします。
                    第2条（利用登録）
                    本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法により利用登録を申請し、当社がこれを承認することで利用登録が完了するものとします。
                    当社は、利用登録の申請者について、以下の事由があると判断した場合、登録を拒否することができます。
                    利用登録の申請に際して虚偽の事項を届け出た場合
                    本規約に違反したことがある者からの申請である場合
                    未成年者が法定代理人の同意を得ていない場合
                    その他、当社が利用登録を相当でないと判断した場合
                    第3条（ユーザー情報の管理）
                    ユーザーは、自己の責任において本サービスのログイン情報を管理するものとします。
                    ユーザーは、いかなる場合にもログイン情報を第三者に譲渡・貸与・公開してはなりません。
                    ログイン情報の不正使用によって生じた損害について、当社は一切の責任を負いません。
                    第4条（禁止事項）
                    ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                    法令または公序良俗に違反する行為 犯罪行為に関連する行為
                    当社、本サービスの他のユーザー、または第三者の権利を侵害する行為
                    本サービスのサーバーまたはネットワークの機能を妨害する行為
                    本サービスによって得られた情報を商業的に利用する行為
                    不正アクセス、またはこれを試みる行為
                    他のユーザーになりすます行為
                    本サービスに関連して、反社会的勢力に直接または間接に利益を供与する行為
                    その他、当社が不適切と判断する行為
                    第5条（本サービスの提供の停止等）
                    当社は、以下のいずれかに該当すると判断した場合、ユーザーへの事前通知なく本サービスの全部または一部の提供を停止または中断することができます。
                    本サービスに係るシステムの保守点検、更新を行う場合
                    地震、落雷、火災、停電、天災、戦争など不可抗力により提供が困難となった場合
                    システム障害等により本サービスの提供が困難となった場合
                    その他、当社が停止・中断を必要と判断した場合
                    本サービスの停止や中断によりユーザーまたは第三者が被った損害について当社は一切責任を負いません。
                    第6条（著作権および知的財産権）
                    本サービス内で提供されるコンテンツ（文章、画像、動画、プログラム等）の著作権・知的財産権はすべて当社または正当な権利者に帰属します。
                    ユーザーは、当社の事前の許可なく、コンテンツを複製・転用・翻案等してはなりません。
                    第7条（ユーザーによる投稿データ）
                    ユーザーが本サービス上で投稿したデータ（文章、画像等）の著作権はユーザー本人に帰属しますが、ユーザーは当社に対し、当社が本サービスの運営、改善、広告に利用するための非独占的利用権を無償で許諾するものとします。
                    当社は、投稿内容が法令や公序良俗に反すると判断した場合、投稿データを削除できるものとします。
                    第8条（利用制限および登録抹消）
                    当社は、ユーザーが以下のいずれかに該当すると判断した場合、事前通知なく利用制限、投稿削除、または利用登録の抹消を行うことができます。
                    本規約に違反した場合 不正行為が発覚した場合
                    30日以上本サービスの利用がない場合
                    当社からの連絡に一定期間返答がない場合
                    その他、当社がサービス利用の継続を不適当と判断した場合
                    第9条（退会）
                    ユーザーは、当社所定の手続により、本サービスから退会できるものとします。
                    第10条（サービス内容の変更、終了）
                    当社は、ユーザーへ事前通知することなく、本サービスの内容の全部または一部を変更または終了することができます。
                    これによりユーザーまたは第三者に生じた損害について、当社は一切責任を負いません。
                    第11条（免責事項）
                    当社は、本サービスに事実上・法律上の瑕疵（安全性、正確性、完全性、最新性など）について、一切の保証をしません。
                    当社は、ユーザーが本サービスを利用したことにより生じたいかなる損害についても責任を負いません。
                    当社は、ユーザーと他ユーザーまたは第三者との間で生じたトラブルについて関与せず、一切責任を負いません。
                    第12条（利用規約の変更）
                    当社は、必要と判断した場合、本規約を変更できるものとします。
                    変更は、本サービスまたは当社ウェブサイトに掲示した時点で効力を生じます。
                    規約変更後に本サービスを利用した場合、ユーザーは変更された規約に同意したものとみなします。
                    第13条（個人情報の取り扱い）
                    当社は、ユーザーの個人情報を別途定める「プライバシーポリシー」に基づき適切に取り扱います。
                    第14条（準拠法・裁判管轄）
                    本規約の解釈には、日本法を適用します。
                    本サービスに関する紛争は、当社所在地を管轄する裁判所を第一審の専属的合意管轄とします。
                    <br />
                    以上
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="w-full mt-6"
                >
                  閉じる
                </button>
              </Modal>

              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  id="terms"
                  name="terms"
                  className={`${styles.acceptCheckbox}`}
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-black cursor-pointer"
                >
                  利用規約を理解し、同意します。
                </label>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="my-8">
            <button
              type="submit"
              disabled={!isTermsAccepted}
              className={`w-full ${
                isTermsAccepted
                  ? styles.create__accountButton
                  : `${styles.disabledButton}`
              }`}
            >
              アカウントを作成する
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
