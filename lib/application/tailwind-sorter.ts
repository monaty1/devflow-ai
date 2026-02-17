// Tailwind Class Sorter: Organizes and sorts Tailwind CSS classes
// Following the official Tailwind CSS recommended order

import type {
  SortResult,
  ClassGroup,
  SorterConfig,
  TailwindCategory,
} from "@/types/tailwind-sorter";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types/tailwind-sorter";

// --- Class Category Patterns ---
// Order matters: more specific patterns should come first

const CATEGORY_PATTERNS: Record<TailwindCategory, RegExp[]> = {
  layout: [
    /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
    /^(static|fixed|absolute|relative|sticky)$/,
    /^(visible|invisible|collapse)$/,
    /^(isolate|isolation-auto)$/,
    /^(z-\d+|z-auto|-z-\d+)$/,
    /^(top|right|bottom|left|inset)(-|$)/,
    /^(float|clear)(-|$)/,
    /^(object-(contain|cover|fill|none|scale-down)|object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top))$/,
    /^(overflow|overscroll)(-|$)/,
    /^(box-(border|content))$/,
    /^(container)$/,
    /^(columns-)/,
    /^(break-(after|before|inside))/,
    /^aspect-/,
  ],
  "flexbox-grid": [
    /^(flex-(row|row-reverse|col|col-reverse|wrap|wrap-reverse|nowrap|1|auto|initial|none))$/,
    /^(flex-grow|flex-shrink|grow|shrink)(-|$)/,
    /^(order-)/,
    /^(grid-cols-|grid-rows-|col-|row-)/,
    /^(auto-cols-|auto-rows-)/,
    /^(gap-|gap-x-|gap-y-)/,
    /^(justify-(normal|start|end|center|between|around|evenly|stretch)|justify-items-|justify-self-)/,
    /^(content-(normal|center|start|end|between|around|evenly|baseline|stretch))/,
    /^(items-(start|end|center|baseline|stretch))/,
    /^(self-(auto|start|end|center|stretch|baseline))/,
    /^(place-(content|items|self)-)/,
    /^(basis-)/,
  ],
  spacing: [
    /^(-?)(p|px|py|pt|pr|pb|pl|ps|pe)-/,
    /^(-?)(m|mx|my|mt|mr|mb|ml|ms|me)-/,
    /^(space-(x|y)-)/,
    /^(-?space-(x|y)-reverse)$/,
  ],
  sizing: [
    /^(w-|min-w-|max-w-)/,
    /^(h-|min-h-|max-h-)/,
    /^(size-)/,
  ],
  typography: [
    /^(font-(sans|serif|mono|\[|thin|extralight|light|normal|medium|semibold|bold|extrabold|black))/,
    /^(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))/,
    /^(text-(left|center|right|justify|start|end))/,
    /^(text-(ellipsis|clip))/,
    /^(text-(transparent|current|inherit))/,
    /^(text-)/,
    /^(antialiased|subpixel-antialiased)$/,
    /^(italic|not-italic)$/,
    /^(font-)/,
    /^(tracking-)/,
    /^(leading-)/,
    /^(list-(inside|outside|none|disc|decimal))/,
    /^(list-image-)/,
    /^(decoration-(auto|from-font|solid|double|dotted|dashed|wavy))/,
    /^(decoration-)/,
    /^(underline-offset-)/,
    /^(underline|overline|line-through|no-underline)$/,
    /^(uppercase|lowercase|capitalize|normal-case)$/,
    /^(truncate)$/,
    /^(indent-)/,
    /^(align-(baseline|top|middle|bottom|text-top|text-bottom|sub|super))/,
    /^(whitespace-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces))/,
    /^(break-(normal|words|all|keep))/,
    /^(hyphens-(none|manual|auto))/,
    /^(content-)/,
  ],
  backgrounds: [
    /^(bg-(inherit|current|transparent|black|white))/,
    /^(bg-(fixed|local|scroll))/,
    /^(bg-(clip|origin)-(border|padding|content|text))/,
    /^(bg-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top))/,
    /^(bg-(repeat|no-repeat|repeat-x|repeat-y|repeat-round|repeat-space))/,
    /^(bg-(auto|cover|contain))/,
    /^(bg-gradient-to-)/,
    /^(bg-none)$/,
    /^(bg-)/,
    /^(from-|via-|to-)/,
  ],
  borders: [
    /^(rounded|rounded-(none|sm|md|lg|xl|2xl|3xl|full))/,
    /^(rounded-(t|r|b|l|tl|tr|br|bl|s|e|ss|se|es|ee)-)/,
    /^(border|border-(0|2|4|8)|border-(x|y|t|r|b|l|s|e))/,
    /^(border-(solid|dashed|dotted|double|hidden|none))/,
    /^(border-(inherit|current|transparent|black|white))/,
    /^(border-(x|y|t|r|b|l|s|e)-)/,
    /^(border-)/,
    /^(divide-(x|y)(-|$))/,
    /^(divide-(solid|dashed|dotted|double|none))/,
    /^(divide-)/,
    /^(outline|outline-(none|dashed|dotted|double))/,
    /^(outline-offset-)/,
    /^(ring|ring-(0|1|2|4|8|inset))/,
    /^(ring-offset-)/,
    /^(ring-)/,
  ],
  effects: [
    /^(shadow|shadow-(sm|md|lg|xl|2xl|inner|none))/,
    /^(shadow-)/,
    /^(opacity-)/,
    /^(mix-blend-)/,
    /^(bg-blend-)/,
  ],
  filters: [
    /^(blur|blur-(none|sm|md|lg|xl|2xl|3xl))/,
    /^(brightness-)/,
    /^(contrast-)/,
    /^(drop-shadow)/,
    /^(grayscale|grayscale-0)/,
    /^(hue-rotate-)/,
    /^(invert|invert-0)/,
    /^(saturate-)/,
    /^(sepia|sepia-0)/,
    /^(backdrop-(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia))/,
  ],
  tables: [
    /^(border-(collapse|separate))/,
    /^(border-spacing)/,
    /^(table-(auto|fixed))/,
    /^(caption-(top|bottom))/,
  ],
  transitions: [
    /^(transition|transition-(none|all|colors|opacity|shadow|transform))/,
    /^(duration-)/,
    /^(ease-(linear|in|out|in-out))/,
    /^(delay-)/,
    /^(animate-(none|spin|ping|pulse|bounce))/,
    /^(animate-)/,
  ],
  transforms: [
    /^(scale-|scale-x-|scale-y-)/,
    /^(-?rotate-)/,
    /^(-?translate-x-|-?translate-y-)/,
    /^(-?skew-x-|-?skew-y-)/,
    /^(transform|transform-(cpu|gpu|none))/,
    /^(origin-)/,
  ],
  interactivity: [
    /^(accent-)/,
    /^(appearance-(none|auto))/,
    /^(cursor-(auto|default|pointer|wait|text|move|help|not-allowed|none|context-menu|progress|cell|crosshair|vertical-text|alias|copy|no-drop|grab|grabbing|all-scroll|col-resize|row-resize|n-resize|e-resize|s-resize|w-resize|ne-resize|nw-resize|se-resize|sw-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|zoom-in|zoom-out))/,
    /^(caret-)/,
    /^(pointer-events-(none|auto))/,
    /^(resize|resize-(none|y|x))/,
    /^(scroll-(auto|smooth))/,
    /^(scroll-(m|p|mt|mr|mb|ml|ms|me|pt|pr|pb|pl|ps|pe)-)/,
    /^(snap-(start|end|center|align-none|normal|always))/,
    /^(snap-(none|x|y|both|mandatory|proximity))/,
    /^(touch-(auto|none|pan-x|pan-left|pan-right|pan-y|pan-up|pan-down|pinch-zoom|manipulation))/,
    /^(select-(none|text|all|auto))/,
    /^(will-change-(auto|scroll|contents|transform))/,
  ],
  svg: [
    /^(fill-)/,
    /^(stroke-)/,
    /^(stroke-(0|1|2))/,
  ],
  accessibility: [
    /^(sr-only|not-sr-only)$/,
    /^(forced-color-adjust-(auto|none))/,
  ],
  other: [],
};

// Variant prefixes in order
const VARIANT_ORDER = [
  // Responsive
  "sm", "md", "lg", "xl", "2xl",
  // State
  "hover", "focus", "focus-within", "focus-visible", "active", "visited",
  "target", "first", "last", "only", "odd", "even", "first-of-type",
  "last-of-type", "only-of-type", "empty", "disabled", "enabled", "checked",
  "indeterminate", "default", "required", "valid", "invalid", "in-range",
  "out-of-range", "placeholder-shown", "autofill", "read-only",
  // Pseudo-elements
  "before", "after", "first-letter", "first-line", "marker", "selection",
  "file", "backdrop", "placeholder",
  // Dark mode
  "dark",
  // Motion
  "motion-safe", "motion-reduce",
  // Print
  "print",
  // Contrast
  "contrast-more", "contrast-less",
  // RTL
  "rtl", "ltr",
  // Portrait/Landscape
  "portrait", "landscape",
  // Aria
  "aria-checked", "aria-disabled", "aria-expanded", "aria-hidden",
  "aria-pressed", "aria-readonly", "aria-required", "aria-selected",
  // Groups and peers
  "group-hover", "group-focus", "group-active", "group-visited",
  "peer-hover", "peer-focus", "peer-active", "peer-checked", "peer-disabled",
];

// --- Conflict Detection ---

function findConflicts(classes: string[]): TailwindConflict[] {
  const conflicts: TailwindConflict[] = [];
  const propertyMap = new Map<string, string[]>();

  for (const cls of classes) {
    const base = getBaseClass(cls);
    const variants = getVariants(cls).sort().join(":");
    
    // Group by common prefix (e.g., p-, m-, text-, bg-)
    const prop = base.split("-")[0] || base;
    
    // Handle special cases like 'flex-row' vs 'flex-col' which are both 'flex-'
    let key = `${variants}:${prop}`;
    if (base.startsWith("flex-") && !base.startsWith("flex-grow") && !base.startsWith("flex-shrink")) {
      key = `${variants}:flex-direction`;
    }

    if (!propertyMap.has(key)) {
      propertyMap.set(key, []);
    }
    propertyMap.get(key)!.push(cls);
  }

  for (const [key, list] of propertyMap.entries()) {
    if (list.length > 1) {
      conflicts.push({
        classes: list,
        type: key.split(":").pop() || "property",
        message: `Potential conflict between ${list.join(", ")}`,
      });
    }
  }

  return conflicts;
}

// --- Semantic Audit ---

function performAudit(classes: string[]): TailwindAuditItem[] {
  const audit: TailwindAuditItem[] = [];
  const baseClasses = classes.map(getBaseClass);
  const classSet = new Set(baseClasses);

  for (const cls of classes) {
    const base = getBaseClass(cls);
    
    if (base === "block" && classSet.has("flex")) {
      audit.push({
        class: cls,
        reason: "'block' is redundant when 'flex' is present",
        suggestion: "remove 'block'",
        severity: "low",
      });
    }
    
    if (base === "w-full" && (classSet.has("flex-col") || classSet.has("grid"))) {
      audit.push({
        class: cls,
        reason: "'w-full' is often redundant in flex-col or grid containers",
        severity: "low",
      });
    }

    if (base === "inline" && (base.includes("p-") || base.includes("m-"))) {
      audit.push({
        class: cls,
        reason: "Vertical padding/margin may not work as expected on 'inline' elements",
        suggestion: "use 'inline-block' instead",
        severity: "medium",
      });
    }
  }

  return audit;
}

// --- Breakpoint Analysis ---

function analyzeBreakpoints(classes: string[]): Record<string, string[]> {
  const breakpoints: Record<string, string[]> = {
    base: [],
    sm: [],
    md: [],
    lg: [],
    xl: [],
    "2xl": [],
  };

  for (const cls of classes) {
    const variants = getVariants(cls);
    const bp = variants.find(v => ["sm", "md", "lg", "xl", "2xl"].includes(v)) || "base";
    if (breakpoints[bp]) {
      breakpoints[bp]!.push(cls);
    }
  }

  return breakpoints;
}

// --- Main Sort Function ---

export function sortClasses(input: string, config: SorterConfig): SortResult {
  const classes = parseClasses(input);
  const uniqueClasses = config.removeDuplicates
    ? [...new Set(classes)]
    : classes;

  const duplicatesRemoved = classes.length - uniqueClasses.length;

  // Analysis
  const conflicts = findConflicts(uniqueClasses);
  const audit = performAudit(uniqueClasses);
  const breakpoints = analyzeBreakpoints(uniqueClasses);

  // Categorize classes
  const categorized = categorizeClasses(uniqueClasses);

  // Sort within categories
  const sorted = config.sortWithinGroups
    ? sortWithinCategories(categorized)
    : categorized;

  // Build output
  const output = formatOutput(sorted, config);

  // Build groups for display
  const groups = buildGroups(sorted);

  return {
    id: crypto.randomUUID(),
    input,
    output,
    stats: {
      totalClasses: classes.length,
      uniqueClasses: uniqueClasses.length,
      duplicatesRemoved,
      groupsCount: groups.filter((g) => g.classes.length > 0).length,
    },
    groups,
    conflicts,
    audit,
    breakpoints,
    sortedAt: new Date().toISOString(),
  };
}

// --- Parsing ---

function parseClasses(input: string): string[] {
  return input
    .trim()
    .split(/\s+/)
    .filter((c) => c.length > 0);
}

// --- Categorization ---

function categorizeClasses(classes: string[]): Map<TailwindCategory, string[]> {
  const categorized = new Map<TailwindCategory, string[]>();

  // Initialize all categories
  for (const category of CATEGORY_ORDER) {
    categorized.set(category, []);
  }

  for (const cls of classes) {
    const category = getCategory(cls);
    const existing = categorized.get(category) ?? [];
    existing.push(cls);
    categorized.set(category, existing);
  }

  return categorized;
}

function getCategory(className: string): TailwindCategory {
  // Strip variant prefixes to get base class
  const baseClass = getBaseClass(className);

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(baseClass)) {
        return category as TailwindCategory;
      }
    }
  }

  return "other";
}

function getBaseClass(className: string): string {
  // Handle negative values
  const isNegative = className.startsWith("-");
  const withoutNegative = isNegative ? className.slice(1) : className;

  // Split by colon to separate variants from base class
  const parts = withoutNegative.split(":");
  const baseClass = parts[parts.length - 1] ?? withoutNegative;

  // Restore negative prefix if needed
  return isNegative ? `-${baseClass}` : baseClass;
}

function getVariants(className: string): string[] {
  const parts = className.split(":");
  return parts.slice(0, -1);
}

// --- Sorting ---

function sortWithinCategories(
  categorized: Map<TailwindCategory, string[]>
): Map<TailwindCategory, string[]> {
  const sorted = new Map<TailwindCategory, string[]>();

  for (const [category, classes] of categorized) {
    sorted.set(category, sortClassList(classes));
  }

  return sorted;
}

function sortClassList(classes: string[]): string[] {
  return [...classes].sort((a, b) => {
    // First, sort by variant complexity (fewer variants first)
    const aVariants = getVariants(a);
    const bVariants = getVariants(b);

    if (aVariants.length !== bVariants.length) {
      return aVariants.length - bVariants.length;
    }

    // Then sort by variant order
    if (aVariants.length > 0 && bVariants.length > 0) {
      const aFirstVariant = aVariants[0] ?? "";
      const bFirstVariant = bVariants[0] ?? "";
      const aVariantOrder = VARIANT_ORDER.indexOf(aFirstVariant);
      const bVariantOrder = VARIANT_ORDER.indexOf(bFirstVariant);

      if (aVariantOrder !== bVariantOrder) {
        const aOrder = aVariantOrder === -1 ? 999 : aVariantOrder;
        const bOrder = bVariantOrder === -1 ? 999 : bVariantOrder;
        return aOrder - bOrder;
      }
    }

    // Finally, sort alphabetically by base class
    const aBase = getBaseClass(a);
    const bBase = getBaseClass(b);
    return aBase.localeCompare(bBase);
  });
}

// --- Output Formatting ---

function formatOutput(
  categorized: Map<TailwindCategory, string[]>,
  config: SorterConfig
): string {
  const allClasses: string[] = [];

  for (const category of CATEGORY_ORDER) {
    const classes = categorized.get(category) ?? [];
    allClasses.push(...classes);
  }

  switch (config.outputFormat) {
    case "multi-line":
      return allClasses.join("\n");
    case "grouped":
      return formatGrouped(categorized);
    case "single-line":
    default:
      return allClasses.join(" ");
  }
}

function formatGrouped(categorized: Map<TailwindCategory, string[]>): string {
  const lines: string[] = [];

  for (const category of CATEGORY_ORDER) {
    const classes = categorized.get(category) ?? [];
    if (classes.length > 0) {
      lines.push(`/* ${CATEGORY_LABELS[category]} */`);
      lines.push(classes.join(" "));
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

// --- Build Groups for Display ---

function buildGroups(categorized: Map<TailwindCategory, string[]>): ClassGroup[] {
  const groups: ClassGroup[] = [];

  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const category = CATEGORY_ORDER[i]!;
    const classes = categorized.get(category) ?? [];

    groups.push({
      id: category,
      name: CATEGORY_LABELS[category],
      classes,
      order: i,
    });
  }

  return groups;
}

// --- Utility Functions ---

export function isValidInput(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;

  // Check if it looks like Tailwind classes
  const classes = parseClasses(trimmed);
  return classes.length > 0;
}

export function countClasses(input: string): number {
  return parseClasses(input).length;
}

export function findDuplicates(input: string): string[] {
  const classes = parseClasses(input);
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const cls of classes) {
    if (seen.has(cls)) {
      if (!duplicates.includes(cls)) {
        duplicates.push(cls);
      }
    } else {
      seen.add(cls);
    }
  }

  return duplicates;
}

// --- Example Input ---

export const EXAMPLE_INPUT = `flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-gray-800 font-medium text-sm border border-gray-200 hover:border-blue-500 cursor-pointer gap-4 w-full max-w-md mx-auto mt-4 mb-2`;

export const MESSY_EXAMPLE = `hover:bg-blue-500 flex p-4 text-white bg-blue-600 items-center flex rounded-lg hover:bg-blue-500 shadow-md p-4 justify-center text-lg font-bold`;
