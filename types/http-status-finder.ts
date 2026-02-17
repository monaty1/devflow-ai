// HTTP Status Code Finder Types

export type HttpStatusCategory = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export interface HttpStatusCode {
  code: number;
  name: string;
  description: string;
  category: HttpStatusCategory;
  whenToUse: string;
  example: string;
  isCommon: boolean;
  relatedHeaders?: string[];
  rfcLink?: string;
  snippets?: Record<string, string>;
}

export interface SearchResult {
  codes: HttpStatusCode[];
  query: string;
  timestamp: string;
}

export interface CategoryInfo {
  category: HttpStatusCategory;
  label: string;
  description: string;
  color: string;
}
