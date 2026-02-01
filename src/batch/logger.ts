type FileAppender = (message: string) => void;

let fileAppender: FileAppender | null = null;

function getFileAppender(): FileAppender | null {
  if (fileAppender) return fileAppender;

  try {
    // Edge Runtime でもビルドエラーにならないように遅延ロード
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const req = eval("require") as NodeRequire;
    const fs = req("fs") as typeof import("fs");
    const path = req("path") as typeof import("path");

    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "batch.log");

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fileAppender = (message: string) => {
      try {
        fs.appendFileSync(logFile, message + "\n", "utf-8");
      } catch (error) {
        console.error("ログファイルへの書き込みに失敗しました:", error);
      }
    };

    return fileAppender;
  } catch {
    fileAppender = null;
    return null;
  }
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

  // ファイル出力（Node Runtime のみ）
  const append = getFileAppender();
  if (append) {
    append(logMessage);
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
