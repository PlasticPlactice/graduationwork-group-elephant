export type PatternType = "none" | "stripe" | "dot" | "check";

export type Book = {
  id: string; 
  pattern: PatternType;
  baseColor: string;
  patternColor?: string;
  review?: string;
  user_id?: string;
  event_id?: string;
};

export type Reactions = {
  id: string;
  reaction: string;
  icon_path: string;
  
  _count?: {
    bookReviewReactions: number;
  }
}

export type BookReviewReactions = {
  id?: string;
  user_id?: string;
  book_review_id?: string;
  reaction_id?: string;
}
