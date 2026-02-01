import type { CSSProperties } from "react";
import type { PatternType } from "@/components/bookshelf/bookData";

type BookPatternProps = {
  pattern: PatternType;
  baseColor: string;
  patternColor?: string;
  className?: string;
};

export function BookPattern({
  pattern,
  baseColor,
  patternColor,
  className = "",
}: BookPatternProps) {
  const effectivePatternColor = patternColor ?? "rgba(0,0,0,0.2)";

  const patternStyle: CSSProperties = {
    backgroundColor: baseColor,
  };

  switch (pattern) {
    case "stripe":
      patternStyle.backgroundImage = `repeating-linear-gradient(45deg, ${effectivePatternColor} 0px, ${effectivePatternColor} 6px, transparent 6px, transparent 16px)`;
      break;
    case "dot":
      patternStyle.backgroundImage = `radial-gradient(circle, ${effectivePatternColor} 20%, transparent 21%)`;
      patternStyle.backgroundSize = "12px 12px";
      break;
    case "check":
      patternStyle.backgroundImage = `linear-gradient(45deg, ${effectivePatternColor} 25%, transparent 25%, transparent 75%, ${effectivePatternColor} 75%, ${effectivePatternColor}), linear-gradient(45deg, ${effectivePatternColor} 25%, transparent 25%, transparent 75%, ${effectivePatternColor} 75%, ${effectivePatternColor})`;
      patternStyle.backgroundPosition = "0 0, 12px 12px";
      patternStyle.backgroundSize = "24px 24px";
      break;
    case "none":
    default:
      break;
  }

  return (
    <div
      className={`h-full w-full rounded-sm ${className}`}
      style={patternStyle}
      aria-hidden="true"
    />
  );
}
