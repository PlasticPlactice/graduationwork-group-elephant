"use client";

import Styles from "@/styles/app/poster.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Html5Qrcode } from "html5-qrcode";

import Modal from "@/app/(app)/Modal";

const QR_REGION_ID = "barcode-scan-reader";

type RakutenBookItem = {
  title: string;
  author: string;
  publishers: string;
  mediumImageUrl?: string;
};

export default function BarcodeScanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isbnInput, setIsbnInput] = useState("");
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);
  const [selectedIsbn, setSelectedIsbn] = useState<string | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookItem, setBookItem] = useState<RakutenBookItem | null>(null);
  const [lastFetchedIsbn, setLastFetchedIsbn] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState(
    "冊子のバーコードを読み込む必要があります。",
  );
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fetchIdRef = useRef(0);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateIsbn13 = useCallback((value: string) => {
    if (!/^\d{13}$/.test(value)) return false;
    const digits = value.split("").map(Number);
    const checksum = digits.reduce(
      (sum, digit, idx) => sum + digit * (idx % 2 === 0 ? 1 : 3),
      0,
    );
    return checksum % 10 === 0;
  }, []);

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current.clear();
    } catch (error) {
      console.error("Failed to stop scanner", error);
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
      setScanStatus("冊子のバーコードを読み込む必要があります。");
    }
  }, []);

  const fetchBookInfo = useCallback(
    async (isbn: string) => {
      if (isbn === lastFetchedIsbn) return;

      const fetchId = ++fetchIdRef.current;
      setBookLoading(true);
      setBookError(null);
      setBookItem(null);

      try {
        const res = await fetch(`/api/books?isbn=${isbn}`);
        if (fetchId !== fetchIdRef.current) return;

        if (!res.ok) {
          setBookError("本の情報の取得に失敗しました。");
          return;
        }

        const data = await res.json();
        const firstItem = data?.Items?.[0]?.Item;

        console.log("firstItem" + JSON.stringify(firstItem));
        if (!firstItem) {
          setBookError("本の情報が見つかりませんでした。");
          return;
        }

        setBookItem({
          title: firstItem.title ?? "",
          author: firstItem.author ?? "",
          publishers: firstItem.publisher ?? "",
          mediumImageUrl: firstItem.mediumImageUrl,
        });

        const bookItemDraft = {
          isbn: isbn,
          eventId: params.id,
          title: firstItem.title ?? "",
          author: firstItem.author ?? "",
          publishers: firstItem.publisher ?? "",
        };

        sessionStorage.setItem("bookItemDraft", JSON.stringify(bookItemDraft));

        setLastFetchedIsbn(isbn);
      } catch (error) {
        console.error("Failed to fetch book info", error);
        if (fetchId === fetchIdRef.current) {
          setBookError("本の情報の取得に失敗しました。");
        }
      } finally {
        if (fetchId === fetchIdRef.current) setBookLoading(false);
      }
    },
    [lastFetchedIsbn, params?.id],
  );

  const handleConfirm = () => {
    router.push("/post/post");
  };

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      const normalized = decodedText.replace(/[^0-9]/g, "");
      if (!normalized) return;

      // Ignore lower (price/classification) code starting with 191/192
      if (normalized.startsWith("191") || normalized.startsWith("192")) {
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
        setShowWarning(true);
        warningTimerRef.current = setTimeout(() => {
          setShowWarning(false);
        }, 2000);
        return;
      }

      // Accept only ISBN prefixes
      if (!(normalized.startsWith("978") || normalized.startsWith("979")))
        return;
      if (normalized.length !== 13) return;
      if (!validateIsbn13(normalized)) return;

      // Clear warning if it was showing
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      setShowWarning(false);

      setDetectedIsbn(normalized);
      setIsbnInput(normalized);
      setSelectedIsbn(normalized);
      fetchBookInfo(normalized);
      await stopScanner();
      setScanStatus("ISBNを確認しました。書籍情報を確認してください。");
      setConfirmOpen(true);
    },
    [fetchBookInfo, stopScanner, validateIsbn13],
  );

  const handleScanFailure = useCallback((error: string) => {
    // html5-qrcode calls this frequently; keep lightweight but log once for diagnostics
    if (error?.toLowerCase().includes("not found")) return;
    console.debug("scan failure", error);
  }, []);

  const startScanner = useCallback(async () => {
    setScanError(null);
    setScanStatus("カメラを起動中...");
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } =
        await import("html5-qrcode");

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_REGION_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
          verbose: false,
        });
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 60,
          aspectRatio: 1.5,
          disableFlip: true,
        },
        handleScanSuccess,
        handleScanFailure,
      );

      setIsScanning(true);
      setScanStatus("スキャン中。バーコードを枠に合わせてください。");
    } catch (error) {
      console.error("Failed to start camera", error);
      setScanError("カメラの起動に失敗しました。権限を確認してください。");
      await stopScanner();
    }
  }, [handleScanFailure, handleScanSuccess, stopScanner]);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount to avoid iOS black screen issues when returning
      stopScanner();
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [stopScanner]);

  const handleManualConfirm = useCallback(() => {
    const normalized = isbnInput.replace(/[^0-9]/g, "");
    if (!validateIsbn13(normalized)) {
      setScanError("ISBNが不正です。13桁のISBNを入力してください。");
      return;
    }
    setDetectedIsbn(normalized);
    setIsbnInput(normalized);
    setSelectedIsbn(normalized);
    fetchBookInfo(normalized);
    setConfirmOpen(true);
    setScanError(null);
  }, [fetchBookInfo, isbnInput, validateIsbn13]);

  const displayIsbn = selectedIsbn ?? detectedIsbn ?? (isbnInput || "未検出");

  return (
    <div>
      {/* Warning overlay for 191/192 barcode detection */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center pb-[25vh] transition-all duration-300 ${
          showWarning ? "opacity-100 bg-black/70" : "opacity-0 bg-transparent"
        }`}
      >
        <div
          className={`text-center text-white px-6 py-8 transition-all duration-300 ${
            showWarning
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          <div className="text-5xl mb-4">警告</div>
          <p className="text-lg leading-relaxed">
            上のISBNバーコードを
            <br />
            読み取ってください
          </p>
        </div>
      </div>

      <div
        className={`${Styles.posterContainer}`}
        style={{ "--color-main": "#36A8B1" } as CSSProperties}
      >
        <div className="mt-7 mb-10">
          <h1 className="font-bold text-center">本のバーコードをスキャン</h1>
          <p className={`font-bold text-center ${Styles.subColor}`}>
            {scanStatus}
          </p>
          {scanError && (
            <p
              className={`text-center ${Styles.text12px} ${Styles.warningColor} mt-1`}
            >
              {scanError}
            </p>
          )}
          <div className={Styles.barcodeScan__readerWrapper}>
            <div
              className={`${Styles.barcodeScan__reader}`}
              id={QR_REGION_ID}
              aria-label="バーコード読み取りエリア"
              style={{
                opacity: isScanning ? 1 : 0.01,
                width: "100%",
                height: "100%",
              }}
            />
            {!isScanning && (
              <div className={Styles.barcodeScan__placeholder}>
                <Image
                  src="/app/barcode.png"
                  alt="バーコード"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={isScanning ? stopScanner : startScanner}
              className="w-full"
            >
              {isScanning ? "カメラを停止" : "カメラを起動"}
            </button>
          </div>
        </div>
        <div>
          <p className={`text-center font-bold mb-4 ${Styles.text16px}`}>
            読み取れない場合は下の入力欄から
            <br />
            ISBNコードを入力してください。
          </p>
          <p className={`${Styles.mainColor} ${Styles.text12px}`}>
            ※ハイフンなしで入力してください。
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              name="isbn"
              placeholder="ISBNコードを入力"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              className="w-full"
            />
            <button
              type="button"
              onClick={handleManualConfirm}
              className="w-2/4"
            >
              確認
            </button>
          </div>

          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <div style={{ "--color-main": "#36A8B1" } as CSSProperties}>
              <div className="mb-10">
                <p>ISBNコード</p>
                <div
                  className={`border rounded-sm py-2 mb-4 ${Styles.text16px}`}
                >
                  <p className={`font-bold text-center`}>{displayIsbn}</p>
                </div>
                <div className="mb-6">
                  <p className="font-bold mb-2">書籍情報</p>
                  <div className="border rounded-sm p-3">
                    {bookLoading && <p>書籍情報を取得中...</p>}
                    {!bookLoading && bookError && (
                      <p
                        className={`${Styles.warningColor} ${Styles.text12px}`}
                      >
                        {bookError}
                      </p>
                    )}
                    {!bookLoading && !bookError && bookItem && (
                      <div className="flex gap-3 items-start">
                        {bookItem.mediumImageUrl ? (
                          <Image
                            src={bookItem.mediumImageUrl}
                            alt={bookItem.title || "book image"}
                            width={100}
                            height={140}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-[100px] h-[140px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                        <div>
                          <p className="font-bold mb-2 break-words">
                            {bookItem.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {bookItem.author}
                          </p>
                        </div>
                      </div>
                    )}
                    {!bookLoading && !bookError && !bookItem && (
                      <p className={Styles.text12px}>
                        ISBNを確認してください。
                      </p>
                    )}
                  </div>
                </div>
                <p className={`font-bold text-center ${Styles.text16px}`}>
                  このISBNで投稿しますか？
                </p>
                <div
                  className={`mb-10 rounded-sm ${Styles.barcodeScan__alertContainer}`}
                >
                  <p
                    className={`py-2 px-3 font-bold ${Styles.warningColor} ${Styles.text12px}`}
                  >
                    この画面を閉じると入力内容は保存されません。
                  </p>
                </div>
              </div>
              <Link href="/post/post">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`w-full mb-3`}
                >
                  投稿へ
                </button>
              </Link>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className={`w-full inline-flex items-center justify-center font-bold border ${Styles.barcodeScan__backButton}`}
              >
                戻る
              </button>
            </div>
          </Modal>

          <div className="flex items-center my-2">
            <p className="">ISBNコードとは</p>
            <button
              type="button"
              aria-label="ISBNコードとはのヘルプを表示"
              onClick={() => setHelpOpen(true)}
              className={`${Styles.helpButton}`}
            >
              <Image
                src="/app/help-circle-outline.png"
                alt="ヘルプ"
                width={30}
                height={20}
              />
            </button>

            <Modal open={helpOpen} onClose={() => setHelpOpen(false)}>
              <div style={{ "--color-main": "#36A8B1" } as CSSProperties}>
                <h2
                  className={`font-bold text-center mb-4 ${Styles.mainColor}`}
                >
                  ISBNコードとは
                </h2>
                <p className="mb-4">
                  ISBNは本を識別するための13桁のコードです。書籍の裏面に印字されています。
                </p>
                <p className="mb-4">
                  入力する際はハイフンを除いた13桁の数字を入力してください。
                </p>
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="w-full mt-6"
                >
                  閉じる
                </button>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
