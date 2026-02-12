"use client";
import styles from "@/styles/app/poster.module.css";

import Image from "next/image";
import { useCallback, useState, useMemo, useEffect } from "react";
import { prefecturesList, iwateMunicipalities } from "@/lib/addressData";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TermsModal from "@/components/modals/TermsModal";
import type { CurrentTermsResponse } from "@/lib/types/terms";

const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
  <li
    className={`flex items-center text-sm transition-colors ${
      met ? "text-green-600" : "text-gray-500"
    }`}
  >
    <span className="mr-2 text-lg">{met ? "✓" : "◦"}</span>
    {text}
  </li>
);

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [termsPdfPath, setTermsPdfPath] = useState<string | null>(null);
  const [termsFileName, setTermsFileName] = useState<string>("利用規約");
  const [termsLoading, setTermsLoading] = useState(true);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSymbol: false,
  });
  const router = useRouter();

  // 利用規約を取得
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch("/api/terms/current");
        const data: CurrentTermsResponse = await response.json();

        if (data.success && data.terms) {
          setTermsPdfPath(data.terms.data_path);
          setTermsFileName(data.terms.file_name);
        } else {
          console.warn("利用規約が取得できませんでした:", data.message);
        }
      } catch (error) {
        console.error("利用規約の取得に失敗しました:", error);
      } finally {
        setTermsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const handleAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value;
      setSelectedAddress(newValue);
      if (newValue !== "岩手県") {
        setSelectedSubAddress("");
      }
    },
    [],
  );

  const isIwateSelected = useMemo(() => {
    return selectedAddress === "岩手県";
  }, [selectedAddress]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // パスワードの要件をリアルタイムでチェック
    setPasswordCriteria({
      minLength: newPassword.length >= 8,
      hasLetter: /[a-zA-Z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // 簡易バリデーション
    if (!nickname) newErrors.nickname = "ニックネームは必須です。";
    if (!password) {
      newErrors.password = "パスワードは必須です。";
    } else if (
      !passwordCriteria.minLength ||
      !passwordCriteria.hasLetter ||
      !passwordCriteria.hasNumber ||
      !passwordCriteria.hasSymbol
    ) {
      newErrors.password = "パスワードがすべての要件を満たしていません。";
    }
    if (!confirmPassword)
      newErrors.confirmPassword = "確認用パスワードは必須です。";
    if (!selectedAddress || selectedAddress === "選択してください")
      newErrors.address = "居住地は必須です。";
    if (!age) newErrors.age = "年齢は必須です。";
    if (!gender) newErrors.gender = "性別は必須です。";

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません。";
    }

    if (isIwateSelected && !selectedSubAddress) {
      newErrors.sub_address =
        "岩手県を選択した場合は、市区町村も選択してください。";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // バリデーション成功時にエラーをクリア
    setErrors({});

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
        setErrors({ form: data.message || "登録に失敗しました" });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({
        form: "エラーが発生しました。しばらくしてから再度お試しください。",
      });
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

  // 都道府県・岩手県市町村リストは `lib/addressData.ts` から読み込む

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
          {/* フォーム全体のエラー表示 */}
          {errors.form && (
            <div className="my-4 p-3 bg-rose-100 border border-rose-500 text-rose-700 rounded">
              {errors.form}
            </div>
          )}

          {/* ニックネームの入力 */}
          <div className={`${styles.create__formContainer}`}>
            <div className={styles.labelContainer}>
              <Image
                src="/app/account.png"
                alt="アカウント登録"
                width={24}
                height={24}
              ></Image>
              <label htmlFor="nickname" className="block font-bold">
                ニックネーム<span className="text-red-500">*</span>
              </label>
            </div>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder=""
              className="w-full block "
              required
              autoComplete="nickname"
            />
            {errors.nickname && (
              <p className="text-red-500 text-sm mt-1">{errors.nickname}</p>
            )}
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
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="8文字以上、英数記号を含む"
              className="w-full block "
              required
              autoComplete="new-password"
            />
            <p>
              8文字以上で、英字・数字・記号をそれぞれ1文字以上含めてください
            </p>
            <ul className="mt-2 space-y-1">
              <CriteriaItem met={passwordCriteria.minLength} text="8文字以上" />
              <CriteriaItem
                met={passwordCriteria.hasLetter}
                text="英字を1文字以上含む"
              />
              <CriteriaItem
                met={passwordCriteria.hasNumber}
                text="数字を1文字以上含む"
              />
              <CriteriaItem
                met={passwordCriteria.hasSymbol}
                text="記号を1文字以上含む"
              />
            </ul>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
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
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力してください"
              className="w-full block "
              required
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
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
              <option value="">選択してください</option>
              {prefecturesList.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
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
                  {iwateMunicipalities.map((city) => (
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
            {errors.sub_address && (
              <p className="text-red-500 text-sm mt-1">{errors.sub_address}</p>
            )}
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
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age}</p>
            )}
          </div>

          {/* 性別選択*/}
          <fieldset className={`${styles.create__formContainer}`}>
            <legend className={`${styles.labelContainer}`}>
              <Image
                src="/app/gender-male.png"
                alt="性別"
                width={24}
                height={24}
              ></Image>
              <span className="font-bold">
                性別<span className="text-red-500"> *</span>
              </span>
            </legend>
            <div className={`ml-2 mt-2 mb-1 flex gap-8`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${styles.genderRadio}`}
                  required
                />
                <label htmlFor="male" className="block cursor-pointer">
                  男性
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${styles.genderRadio}`}
                />
                <label htmlFor="female" className="block cursor-pointer">
                  女性
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="other"
                  name="gender"
                  value="other"
                  checked={gender === "other"}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${styles.genderRadio}`}
                />
                <label htmlFor="other" className="block cursor-pointer">
                  その他
                </label>
              </div>
            </div>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </fieldset>

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
              id="introduction"
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
                disabled={termsLoading}
              >
                {termsLoading ? "読み込み中..." : "利用規約を読む"}
              </button>

              <TermsModal
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
                pdfPath={termsPdfPath}
                fileName={termsFileName}
              />

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
