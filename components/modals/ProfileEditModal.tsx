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
import { useToast } from "@/contexts/ToastContext";

import Styles from "@/styles/app/poster.module.css";
import modalStyles from "@/styles/app/modal.module.css";
import { prefecturesList, iwateMunicipalities } from "@/lib/addressData";

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
  const [selectedPrefecture, setSelectedPrefecture] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<number>(3); // 1: male, 2: female, 3: other
  const [introduction, setIntroduction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // 初期値のセット
  useEffect(() => {
    if (open && profileData) {
      setNickName(profileData.nickName || "");
      setSelectedPrefecture(profileData.address || "");
      setSelectedMunicipality(profileData.addressDetail || "");
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
  // 背景スクロールは親コンポーネント（共通 Modal コンポーネント）で制御するか、
  // CSS の .modalScrollArea を使用して内部スクロールさせてください。
  // このコンポーネントでは body の overflow を直接操作しないようにします。
  useEffect(() => {
    return () => {};
  }, [open]);

  // 背景クリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrefectureChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value;
      setSelectedPrefecture(newValue);
      // 岩手県以外になったら詳細（市町村）をクリア
      if (newValue !== "岩手県") {
        setSelectedMunicipality("");
      }
    },
    [],
  );

  const isIwatePrefectureSelected = useMemo(() => {
    return selectedPrefecture === "岩手県";
  }, [selectedPrefecture]);

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
          address: selectedPrefecture,
          addressDetail: selectedMunicipality,
          age,
          gender,
          introduction,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          (data as { message?: string }).message || "更新に失敗しました";
        throw new Error(message);
      }

      addToast({ type: "success", message: "プロフィールを更新しました" });
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error(error);
      const fallbackMessage =
        error instanceof Error ? error.message : "エラーが発生しました。";
      addToast({ type: "error", message: fallbackMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 都道府県と岩手県の市町村は `lib/addressData.ts` からインポートしています

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
            className={`bg-white rounded-xl my-auto shadow-lg w-full p-6 max-h-[85vh] ${modalStyles.modalContent}`}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            <div className={modalStyles.modalScrollArea}>
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
                        居住地（都道府県）
                        <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <select
                      name="address"
                      id="address"
                      value={selectedPrefecture}
                      onChange={handlePrefectureChange}
                      className={`text-black ${Styles.inputSelectForm}`}
                      required
                    >
                      <option value="">選択してください</option>
                      {prefecturesList.map((pref) => (
                        <option key={pref} value={pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 詳細の居住地の選択 */}
                  <div className={`mb-1 ${Styles.create__formContainer}`}>
                    <label htmlFor="addressDetail" className="block font-bold">
                      居住地（市区町村）
                    </label>

                    <select
                      name="addressDetail"
                      id="addressDetail"
                      value={selectedMunicipality}
                      onChange={(e) => setSelectedMunicipality(e.target.value)}
                      className={`text-black ${Styles.inputSelectForm}`}
                      disabled={!isIwatePrefectureSelected}
                    >
                      {!isIwatePrefectureSelected ? (
                        <option value="" className={`${Styles.subColor}`}>
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
                    {isSubmitting ? "保存中..." : "変更を保存"}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
