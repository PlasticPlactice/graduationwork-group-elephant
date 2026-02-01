import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "batch.log");

// ログディレクトリが存在しなければ作成
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * ログをファイルとコンソール両方に出力する
 */
export function logBatch(
  level: "INFO" | "SUCCESS" | "ERROR" | "WARN",
  message: string,
) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  // コンソール出力
  switch (level) {
    case "SUCCESS":
      console.log(`✓ ${message}`);
      break;
    case "ERROR":
      console.error(`✗ ${message}`);
      break;
    case "WARN":
      console.warn(`⚠ ${message}`);
      break;
    case "INFO":
    default:
      console.log(`ℹ ${message}`);
  }

  // ファイル出力
  try {
    fs.appendFileSync(LOG_FILE, logMessage + "\n", "utf-8");
  } catch (error) {
    console.error("ログファイルへの書き込みに失敗しました:", error);
  }
}

export function logBatchInfo(message: string) {
  logBatch("INFO", message);
}

export function logBatchSuccess(message: string) {
  logBatch("SUCCESS", message);
}

export function logBatchError(message: string) {
  logBatch("ERROR", message);
}

export function logBatchWarn(message: string) {
  logBatch("WARN", message);
}
