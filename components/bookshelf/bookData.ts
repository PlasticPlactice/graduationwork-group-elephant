export type PatternType = "none" | "stripe" | "dot" | "check";

export type Book = {
  id: string;
  pattern: PatternType;
  baseColor: string;
  patternColor?: string;
  review?: string;
};

export type Reactions = {
  id: string;
  reaction: string;
  icon_path: string;
  
  _count?: {
    bookReviewReactions: number;
  }
}
