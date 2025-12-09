"use client";

import Styles from "@/styles/app/account-create.module.css";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";

import Modal from "@/app/(app)/poster/barcode-scan/Modal";

const QR_REGION_ID = "barcode-scan-reader";

export default function BarcodeScanPage() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isbnInput, setIsbnInput] = useState("");
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState(
    "冊子のバーコードを読み込む必要があります。"
  );
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const validateIsbn13 = useCallback((value: string) => {
    if (!/^\d{13}$/.test(value)) return false;
    const digits = value.split("").map(Number);
    const checksum = digits.reduce(
      (sum, digit, idx) => sum + digit * (idx % 2 === 0 ? 1 : 3),
      0
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

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      const normalized = decodedText.replace(/[^0-9]/g, "");
      if (!normalized) return;

      // Ignore lower (price/classification) code starting with 191/192
      if (normalized.startsWith("191") || normalized.startsWith("192")) {
        setScanStatus((prev) => {
          const warningMsg = "上のバーコードを読み取ってください。";
          return prev === warningMsg ? prev : warningMsg;
        });
        return;
      }

      // Accept only ISBN prefixes
      if (!(normalized.startsWith("978") || normalized.startsWith("979")))
        return;
      if (normalized.length !== 13) return;
      if (!validateIsbn13(normalized)) return;

      setDetectedIsbn(normalized);
      setIsbnInput(normalized);
      await stopScanner();
      setScanStatus("ISBNを検出しました。入力欄をご確認ください。");
      setConfirmOpen(true);
    },
    [stopScanner, validateIsbn13]
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
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_REGION_ID, {
          formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
          verbose: false,
        });
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 200 },
          disableFlip: true,
        },
        handleScanSuccess,
        handleScanFailure
      );

      setIsScanning(true);
      setScanStatus("スキャン中。バーコードを枠に合わせてください。");
    } catch (error) {
      console.error("Failed to start camera", error);
      setScanError(
        "カメラの起動に失敗しました。権限を許可して再度お試しください。"
      );
      await stopScanner();
    }
  }, [handleScanFailure, handleScanSuccess, stopScanner]);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount to avoid iOS black screen issues when returning
      stopScanner();
    };
  }, [stopScanner]);

  const handleManualConfirm = useCallback(() => {
    const normalized = isbnInput.replace(/[^0-9]/g, "");
    if (!validateIsbn13(normalized)) {
      setScanError("ISBNが不正です。13桁の数字を入力してください。");
      return;
    }
    setDetectedIsbn(normalized);
    setIsbnInput(normalized);
    setConfirmOpen(true);
    setScanError(null);
  }, [isbnInput, validateIsbn13]);

  return (
    <div>
      <a href="" className={`block mt-7 ml-3 font-bold ${Styles.subColor}`}>
        <span>&lt;</span> ファンサイトはこちら
      </a>
      <div className={`${Styles.posterContainer}`}>
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
              style={{ opacity: isScanning ? 1 : 0.01 }}
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
            読み取れない方、読み取りにくい方はこちら
          </p>
          <p className={`${Styles.mainColor} ${Styles.text12px}`}>
            ※ハイフンなしで入力してください
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
              検索
            </button>
          </div>

          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <div className="mb-10">
              <p>ISBNコード</p>
              <div className={`border rounded-sm py-2 mb-4 ${Styles.text16px}`}>
                <p className={`font-bold text-center`}>
                  {detectedIsbn ?? (isbnInput || "未取得")}
                </p>
              </div>
              <p className={`font-bold text-center ${Styles.text16px}`}>
                こちらのISBNで登録を進めますか？
              </p>
              <div
                className={`mb-10 rounded-sm ${Styles.barcodeScan__alertContainer}`}
              >
                <p
                  className={`py-2 px-3 font-bold ${Styles.warningColor} ${Styles.text12px}`}
                >
                  この先のページに進むと、本の変更はできません。内容をご確認の上、「登録へ」ボタンを押してください。
                </p>
              </div>
            </div>
            <button type="button" className={`w-full mb-3`}>
              登録へ
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className={`w-full inline-flex items-center justify-center font-bold border ${Styles.barcodeScan__backButton}`}
            >
              戻る
            </button>
          </Modal>

          <div className="flex items-center my-2">
            <p className="">ISBNコードとは</p>
            <button
              type="button"
              aria-label="ISBNコードのヘルプを表示"
              onClick={() => setHelpOpen(true)}
              className={`${Styles.helpButton}`}
            >
              <Image
                src="/app/help-circle-outline.png"
                alt="ヘルプマーク"
                width={30}
                height={20}
              />
            </button>

            <Modal open={helpOpen} onClose={() => setHelpOpen(false)}>
              <h2 className="font-bold text-center mb-4">ISBNコードとは？</h2>
              <p className="mb-4">
                ISBNコードは、本の背表紙や裏表紙に記載されている13桁または10桁の数字です。このコードは、書籍を特定するための国際的な標準番号であり、出版社や書店が本を管理する際に使用されます。
              </p>
              <p className="mb-4">
                13桁のISBNコードは通常、「978」または「979」で始まり、その後に出版社コード、タイトルコード、チェックデジットが続きます。10桁のISBNコードは、古い形式であり、現在は主に13桁の形式が使用されています。
              </p>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="w-full mt-6"
              >
                閉じる
              </button>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
