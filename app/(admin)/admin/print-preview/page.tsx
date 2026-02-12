"use client";

import "@/styles/admin/print-preview.css";
import { Suspense, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";

type PreviewReview = {
  id: number;
  book_title: string;
  author: string | null;
  publishers: string | null;
  isbn: string;
  nickname: string;
  review: string;
  self_introduction: string;
  color: string;
  pattern: string;
  pattern_color: string;
};

const stripHtml = (html: string) => {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]*>/g, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").trim();
};

const extractFirstFontColor = (html: string) => {
  if (!html) return null;

  const colorPattern = /color\s*:\s*([^;]+)/i;
  if (typeof window === "undefined") {
    const match = html.match(colorPattern);
    return match?.[1]?.trim() ?? null;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const colorElement = doc.body.querySelector<HTMLElement>("[style*='color']");
  if (!colorElement) return null;

  const styleAttr = colorElement.getAttribute("style");
  if (!styleAttr) return null;

  const match = styleAttr.match(colorPattern);
  return match?.[1]?.trim() ?? null;
};

const normalizePattern = (rawPattern: string | undefined) => {
  const value = (rawPattern ?? "").trim().toLowerCase();

  if (["dot", "dots", "a"].includes(value)) {
    return { key: "dot", label: "ドット" };
  }
  if (["stripe", "stripes", "line", "lines", "b"].includes(value)) {
    return { key: "stripe", label: "ストライプ" };
  }
  if (["check", "checked", "grid", "c"].includes(value)) {
    return { key: "check", label: "チェック" };
  }
  if (["none", "default", "plain", ""].includes(value)) {
    return { key: "none", label: "模様なし" };
  }

  return { key: "none", label: rawPattern ?? "未設定" };
};

const toPatternPreviewStyle = (
  pattern: string | undefined,
  patternColor: string | undefined,
): CSSProperties => {
  const color = patternColor || "#000000";
  const normalized = normalizePattern(pattern);

  switch (normalized.key) {
    case "stripe":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0px, ${color} 4px, transparent 4px, transparent 10px)`,
      };
    case "dot":
      return {
        backgroundImage: `radial-gradient(circle, ${color} 24%, transparent 26%)`,
        backgroundSize: "8px 8px",
      };
    case "check":
      return {
        backgroundImage: `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color})`,
        backgroundPosition: "0 0, 6px 6px",
        backgroundSize: "12px 12px",
      };
    default:
      return { backgroundImage: "none", backgroundColor: "transparent" };
  }
};

const toFramePatternStyle = (
  pattern: string | undefined,
  mainColor: string,
  patternColor: string,
): CSSProperties => {
  const normalized = normalizePattern(pattern);

  switch (normalized.key) {
    case "stripe":
      return {
        backgroundColor: mainColor,
        backgroundImage: `repeating-linear-gradient(120deg, ${patternColor}, ${patternColor} 28px, transparent 28px, transparent 43px)`,
      };
    case "dot":
      return {
        backgroundColor: mainColor,
        backgroundImage: `radial-gradient(circle, ${patternColor} 24%, transparent 26%)`,
        backgroundSize: "24px 24px",
      };
    case "check":
      return {
        backgroundColor: mainColor,
        backgroundImage: `linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 75%, ${patternColor} 75%, ${patternColor}), linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 75%, ${patternColor} 75%, ${patternColor})`,
        backgroundPosition: "0 0, 12px 12px",
        backgroundSize: "24px 24px",
      };
    default:
      return {
        backgroundColor: mainColor,
        backgroundImage: "none",
      };
  }
};

const applyFontColorToHtml = (html: string, color: string) => {
  if (typeof window === "undefined") return html;

  const hasTag = /<[^>]+>/.test(html);
  const sourceHtml = hasTag ? html : `<p>${html}</p>`;
  const doc = new DOMParser().parseFromString(sourceHtml, "text/html");
  const targets = doc.body.querySelectorAll<HTMLElement>(
    "p, span, div, li, h1, h2, h3, h4, h5, h6, blockquote",
  );

  if (targets.length === 0) {
    const p = doc.createElement("p");
    p.textContent = doc.body.textContent ?? "";
    p.style.color = color;
    doc.body.innerHTML = "";
    doc.body.appendChild(p);
  } else {
    targets.forEach((el) => {
      el.style.color = color;
    });
  }

  return doc.body.innerHTML;
};

function PrintPreviewContent() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");

  const [activeDesignTarget, setActiveDesignTarget] = useState<
    "main" | "pattern" | "font"
  >("main");
  const [selectedMainColor, setSelectedMainColor] = useState<string>("#FFFFFF");
  const [selectedPatternColor, setSelectedPatternColor] = useState<string>("#FFFFFF");
  const [selectedFontColor, setSelectedFontColor] = useState<string>("#000000");
  const [review, setReview] = useState<PreviewReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const selectableColors = useMemo(
    () => [
      { name: "ホワイト", value: "#FFFFFF" },
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
    ],
    [],
  );

  const colorNameMap = useMemo(
    () => new Map(selectableColors.map((c) => [c.value.toUpperCase(), c.name])),
    [selectableColors],
  );

  const toColorLabel = (color: string) =>
    colorNameMap.get((color || "").toUpperCase()) ?? color ?? "未設定";

  const handlePrint = () => {
    window.print();
  };

  const handleApply = async () => {
    if (!reviewId || !review) return;

    setIsSaving(true);
    setError("");
    try {
      const coloredReviewHtml = applyFontColorToHtml(
        review.review ?? "",
        selectedFontColor,
      );

      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review: coloredReviewHtml,
          color: selectedMainColor,
          pattern_color: selectedPatternColor,
        }),
      });

      if (!res.ok) {
        throw new Error("デザイン設定の保存に失敗しました。");
      }

      const updated = (await res.json()) as Pick<
        PreviewReview,
        "review" | "color" | "pattern_color"
      >;

      setReview((prev) =>
        prev
          ? {
              ...prev,
              review: updated.review ?? prev.review,
              color: updated.color ?? prev.color,
              pattern_color: updated.pattern_color ?? prev.pattern_color,
            }
          : prev,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "デザイン設定の保存に失敗しました。",
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!reviewId) {
      setReview(null);
      setError("レビューIDが指定されていません。");
      return;
    }

    let mounted = true;

    const fetchReview = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/reviews/${reviewId}`);
        if (!res.ok) {
          throw new Error("レビューの取得に失敗しました。");
        }
        const data = (await res.json()) as PreviewReview;
        if (mounted) {
          setReview(data);
          setSelectedMainColor(data.color || "#FFFFFF");
          setSelectedPatternColor(data.pattern_color || "#FFFFFF");
        }
      } catch (e) {
        if (mounted) {
          setReview(null);
          setError(
            e instanceof Error ? e.message : "レビューの取得に失敗しました。",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchReview();

    return () => {
      mounted = false;
    };
  }, [reviewId]);

  const reviewText = useMemo(() => stripHtml(review?.review ?? ""), [review?.review]);
  const normalizedPattern = useMemo(() => normalizePattern(review?.pattern), [review?.pattern]);
  const patternPreviewStyle = useMemo(
    () => toPatternPreviewStyle(review?.pattern, selectedPatternColor),
    [review?.pattern, selectedPatternColor],
  );
  const fontColor = useMemo(
    () => extractFirstFontColor(review?.review ?? "") ?? "#000000",
    [review?.review],
  );
  const printAreaStyle = useMemo(
    () =>
      toFramePatternStyle(
        review?.pattern,
        selectedMainColor || "#ffb784",
        selectedPatternColor || "#ffffff",
      ),
    [review?.pattern, selectedMainColor, selectedPatternColor],
  );

  useEffect(() => {
    setSelectedFontColor(fontColor);
  }, [fontColor]);

  const currentPaletteColor =
    activeDesignTarget === "main"
      ? selectedMainColor
      : activeDesignTarget === "pattern"
        ? selectedPatternColor
        : selectedFontColor;

  const handlePaletteColorSelect = (color: string) => {
    if (activeDesignTarget === "main") {
      setSelectedMainColor(color);
      return;
    }
    if (activeDesignTarget === "pattern") {
      setSelectedPatternColor(color);
      return;
    }
    setSelectedFontColor(color);
  };

  return (
    <main className="print-preview-page">
      <div className="preview-panel">
        <h2 className="panel-head">プレビュー</h2>
        <section className="print-area" style={printAreaStyle}>
          <div className="card-area">
            <p id="book-review" style={{ color: selectedFontColor }}>
              {isLoading
                ? "読み込み中..."
                : error
                  ? error
                  : reviewText || "書評データがありません。"}
            </p>

            <div id="reviewer-section">
              <p>【評者】{review?.nickname ?? "-"}</p>
              <p id="number">No. {review ? String(review.id).padStart(3, "0") : "---"}</p>
              <p id="reviewer-introduction">
                {review?.self_introduction ?? "自己紹介データがありません。"}
              </p>
              <p className="mt-3">書籍: {review?.book_title ?? "-"}</p>
              <p>著者: {review?.author ?? "-"}</p>
              <p>出版社: {review?.publishers ?? "-"}</p>
              <p>ISBN: {review?.isbn ?? "-"}</p>
            </div>
          </div>
        </section>

        <div className="preview-action-row">
          <button id="print-btn" onClick={handlePrint}>
            印刷
          </button>
        </div>
      </div>

      <div className="design-panel">
        <h2 className="panel-head">デザイン設定</h2>
        <div className="design-area">
          <h3 className="design-sub-head font-bold">メインカラー</h3>
          <div
            className="flex items-center gap-1 mb-4 cursor-pointer"
            onClick={() => setActiveDesignTarget("main")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveDesignTarget("main");
            }}
            style={{
              border:
                activeDesignTarget === "main"
                  ? "2px solid #1f2937"
                  : "2px solid transparent",
              borderRadius: "8px",
              padding: "4px 6px",
            }}
          >
            <p
              className="main-color-pick rounded-full"
              style={{ backgroundColor: selectedMainColor || "#fe9c56" }}
            />
            <p className="main-color-text">{toColorLabel(selectedMainColor)}</p>
          </div>

          <h3 className="design-sub-head font-bold">柄</h3>
          <div className="flex items-center gap-1 mb-4">
            <p className="pattern-pick rounded-full" style={patternPreviewStyle} />
            <p className="main-color-text">{normalizedPattern.label}</p>
          </div>

          <h3 className="design-sub-head font-bold">柄のカラー</h3>
          <div
            className="flex items-center gap-1 mb-6 cursor-pointer"
            onClick={() => setActiveDesignTarget("pattern")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveDesignTarget("pattern");
            }}
            style={{
              border:
                activeDesignTarget === "pattern"
                  ? "2px solid #1f2937"
                  : "2px solid transparent",
              borderRadius: "8px",
              padding: "4px 6px",
            }}
          >
            <p
              className="pattern-color-pick rounded-full"
              style={{ backgroundColor: selectedPatternColor || "#ffffff" }}
            />
            <p className="main-color-text">{toColorLabel(selectedPatternColor)}</p>
          </div>

          <h3 className="design-sub-head font-bold">フォントカラー</h3>
          <div
            className="flex items-center gap-1 mb-4 cursor-pointer"
            onClick={() => setActiveDesignTarget("font")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveDesignTarget("font");
            }}
            style={{
              border:
                activeDesignTarget === "font"
                  ? "2px solid #1f2937"
                  : "2px solid transparent",
              borderRadius: "8px",
              padding: "4px 6px",
            }}
          >
            <p className="font-color-text">現在:</p>
            <p
              className="pattern-color-pick rounded-full"
              style={{ backgroundColor: selectedFontColor }}
            />
            <p className="main-color-text">{toColorLabel(selectedFontColor)}</p>
          </div>

          <div>
            <p className="font-color-text">
              選択（変更対象:
              {activeDesignTarget === "main"
                ? " メインカラー"
                : activeDesignTarget === "pattern"
                  ? " 柄のカラー"
                  : " フォントカラー"}
              ）
            </p>
            <div className="grid grid-cols-6 gap-3 mt-2">
              {selectableColors.map((color) => (
                <button
                  key={`palette-${color.value}`}
                  className={`color-btn rounded-full${currentPaletteColor === color.value ? " selected" : ""}`}
                  onClick={() => handlePaletteColorSelect(color.value)}
                  aria-label={color.name}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div className="design-action-row">
            <button className="applicable-btn" onClick={handleApply} disabled={isSaving}>
              {isSaving ? "保存中..." : "適用"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="print-preview-page">読み込み中...</main>}>
      <PrintPreviewContent />
    </Suspense>
  );
}
