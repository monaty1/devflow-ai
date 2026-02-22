// Tailwind Class Sorter Types
// Organizes and sorts Tailwind CSS classes

export interface SortResult {
  id: string;
  input: string;
  output: string;
  stats: SortStats;
  groups: ClassGroup[];
  conflicts: TailwindConflict[];
  audit: TailwindAuditItem[];
  breakpoints: Record<string, string[]>;
  sortedAt: string;
}

export interface TailwindConflict {
  classes: string[];
  type: string;
  message: string;
}

export interface TailwindAuditItem {
  class: string;
  reason: string;
  suggestion?: string;
  severity: "low" | "medium";
}

export interface SortStats {
  totalClasses: number;
  uniqueClasses: number;
  duplicatesRemoved: number;
  groupsCount: number;
}

export interface ClassGroup {
  id: string;
  name: string;
  classes: string[];
  order: number;
}

export interface SorterConfig {
  removeDuplicates: boolean;
  sortWithinGroups: boolean;
  outputFormat: OutputFormat;
}

export type OutputFormat = "single-line" | "multi-line" | "grouped";

export const DEFAULT_SORTER_CONFIG: SorterConfig = {
  removeDuplicates: true,
  sortWithinGroups: true,
  outputFormat: "single-line",
};

// Category definitions for grouping
export type TailwindCategory =
  | "layout"
  | "flexbox-grid"
  | "spacing"
  | "sizing"
  | "typography"
  | "backgrounds"
  | "borders"
  | "effects"
  | "filters"
  | "tables"
  | "transitions"
  | "transforms"
  | "interactivity"
  | "svg"
  | "accessibility"
  | "other";

export const CATEGORY_LABELS: Record<TailwindCategory, string> = {
  layout: "Layout",
  "flexbox-grid": "Flexbox & Grid",
  spacing: "Spacing",
  sizing: "Sizing",
  typography: "Typography",
  backgrounds: "Backgrounds",
  borders: "Borders",
  effects: "Effects",
  filters: "Filters",
  tables: "Tables",
  transitions: "Transitions & Animation",
  transforms: "Transforms",
  interactivity: "Interactivity",
  svg: "SVG",
  accessibility: "Accessibility",
  other: "Other",
};

export const CATEGORY_ORDER: TailwindCategory[] = [
  "layout",
  "flexbox-grid",
  "spacing",
  "sizing",
  "typography",
  "backgrounds",
  "borders",
  "effects",
  "filters",
  "tables",
  "transitions",
  "transforms",
  "interactivity",
  "svg",
  "accessibility",
  "other",
];
