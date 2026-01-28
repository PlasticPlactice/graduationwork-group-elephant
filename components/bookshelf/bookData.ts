export type PatternType = "none" | "stripe" | "dot" | "check";

export type Book = {
  id: string;
  pattern: PatternType;
  baseColor: string;
  patternColor?: string;
  review?: string;
};
