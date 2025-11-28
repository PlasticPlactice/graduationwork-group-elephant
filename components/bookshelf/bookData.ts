export type PatternType = "none" | "stripe" | "dot" | "check";

export type Book = {
  id: string;
  pattern: PatternType;
  baseColor: string;
  patternColor?: string;
};

export const BOOKS: Book[] = [
  {
    id: "b1",
    pattern: "stripe",
    baseColor: "#ffffff",
    patternColor: "#71b9ff",
  },
  { id: "b2", pattern: "check", baseColor: "#ffffff", patternColor: "#ff5b5b" },
  { id: "b3", pattern: "dot", baseColor: "#ffffff", patternColor: "#333333" },
  { id: "b4", pattern: "none", baseColor: "#f5f5f5" },
  {
    id: "b5",
    pattern: "stripe",
    baseColor: "#ffffff",
    patternColor: "#ffc857",
  },
  { id: "b6", pattern: "check", baseColor: "#ffffff", patternColor: "#6ac48f" },
  { id: "b7", pattern: "dot", baseColor: "#ffffff", patternColor: "#5555ff" },
  { id: "b8", pattern: "none", baseColor: "#f0f0f0" },
  {
    id: "b9",
    pattern: "stripe",
    baseColor: "#fdf4ff",
    patternColor: "#d946ef",
  },
  {
    id: "b10",
    pattern: "check",
    baseColor: "#fef2f2",
    patternColor: "#fb7185",
  },
  {
    id: "b11",
    pattern: "stripe",
    baseColor: "#fdf4ff",
    patternColor: "#d946ef",
  },
  {
    id: "b12",
    pattern: "check",
    baseColor: "#fef2f2",
    patternColor: "#fb7185",
  },
];
