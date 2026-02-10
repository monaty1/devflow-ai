export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  category: ToolCategory;
  features: string[];
  tags: string[];
  rating: number;
  usersCount: number;
  isFree: boolean;
  color: string;
}

export type ToolCategory =
  | "analysis"
  | "review"
  | "calculation"
  | "visualization"
  | "management"
  | "generation"
  | "formatting";

export interface FavoriteItem {
  toolId: string;
  addedAt: string;
}
