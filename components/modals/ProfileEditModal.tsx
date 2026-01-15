"use client";
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import Styles from "@/styles/app/poster.module.css";
import modalStyles from "@/styles/app/modal.module.css";

interface ProfileData {
  nickName: string;
  address: string;
  addressDetail: string;
  age: number;
  gender: number;
  introduction: string;
}

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profileData?: ProfileData;
  onUpdate?: () => void; // 更新後に親コンポーネントに通知するためのコールバック
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  open,
  onClose,
  profileData,
  onUpdate,
}) => {
  const [nickName, setNickName] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<number>(3); // 1: male, 2: female, 3: other
  const [introduction, setIntroduction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // 初期値のセット
  useEffect(() => {
    if (open && profileData) {
      setNickName(profileData.nickName || "");
      setAddress(profileData.address || "");
      setAddressDetail(profileData.addressDetail || "");
      setAge(profileData.age || "");
      setGender(profileData.gender || 3);
      setIntroduction(profileData.introduction || "");
    }
  }, [open, profileData]);

  // ESCキーで閉じる
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // 背景スクロール禁止
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // 背景クリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddressChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value;
      setAddress(newValue);
      // 岩手県以外になったら詳細をクリア
      if (newValue !== "岩手県") {
        setAddressDetail("");
      }
    },
    []
  );

  const isIwateSelected = useMemo(() => {
    return address === "岩手県";
  }, [address]);

  // 更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickName,
          address,
          addressDetail,
          age,
          gender,
          introduction,
        }),
      });

      if (!res.ok) {
        throw new Error("更新に失敗しました");
      }

      alert("プロフィールを更新しました");
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleOverlayClick}
          ref={modalRef}
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`bg-white rounded-xl my-auto shadow-lg w-full p-6 max-h-[85vh] overflow-y-auto ${modalStyles.modalContent}`}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            {/* 中身をかく */}
            <p className={`font-bold ${Styles.mainColor} ${Styles.text24px}`}>
              プロフィール編集
            </p>
            <div className={`border-b-2 ${Styles.mainColor}`}></div>
            <div>
              <form onSubmit={handleSubmit}>
                {/* ニックネームの入力 */}
                <div className={`${Styles.create__formContainer}`}>
                  <div className={Styles.labelContainer}>
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
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                    placeholder=""
                    className="w-full block "
                    required
                  />
                </div>

                {/* 居住地の選択 */}
                <div className={`${Styles.create__formContainer}`}>
                  <div className={Styles.labelContainer}>
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
                    value={address}
                    onChange={handleAddressChange}
                    className={`text-black ${Styles.inputSelectForm}`}
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
                <div className={`mb-1 ${Styles.create__formContainer}`}>
                  <label htmlFor="addressDetail" className="block font-bold">
                    詳細居住地（市区町村）
                  </label>

                  <select
                    name="addressDetail"
                    id="addressDetail"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className={`text-black ${Styles.inputSelectForm}`}
                    disabled={!isIwateSelected}
                  >
                    {!isIwateSelected ? (
                      <option
                        value=""
                        className={`${Styles.subColor}`}
                        // disabled // selectedがあるとdisabledでも表示されることがあるので念のため
                      >
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
                <div className={`${Styles.create__formContainer}`}>
                  <div className={Styles.labelContainer}>
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
                    id="old"
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value ? Number(e.target.value) : "")
                    }
                    className={`text-black ${Styles.inputSelectForm}`}
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
                  className={`${Styles.labelContainer} ${Styles.create__formContainer}`}
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
                      value="1"
                      checked={gender === 1}
                      onChange={() => setGender(1)}
                      className={`${Styles.genderRadio}`}
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
                      value="2"
                      checked={gender === 2}
                      onChange={() => setGender(2)}
                      className={`${Styles.genderRadio}`}
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
                      value="3"
                      checked={gender === 3}
                      onChange={() => setGender(3)}
                      className={`${Styles.genderRadio}`}
                    />
                    <label htmlFor="other" className="block">
                      その他
                    </label>
                  </div>
                </div>

                {/* 自己紹介*/}
                <div className={`${Styles.create__formContainer}`}>
                  <div className={Styles.labelContainer}>
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
                    className={`w-full ${Styles.colsIntroduction}`}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full mt-7`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "送信中..." : "送信"}
                </button>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className={`w-full mt-4 ${Styles.barcodeScan__backButton}`}
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
