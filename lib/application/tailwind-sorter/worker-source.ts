export const TAILWIND_SORTER_WORKER_SOURCE = `
// --- Self-contained Tailwind Sorter Logic ---

const CATEGORY_ORDER = [
  "layout", "flexbox-grid", "spacing", "sizing", "typography", 
  "backgrounds", "borders", "effects", "filters", "tables", 
  "transitions", "transforms", "interactivity", "svg", "accessibility", "other"
];

const CATEGORY_PATTERNS = {
  layout: [
    /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
    /^(static|fixed|absolute|relative|sticky)$/,
    /^(visible|invisible|collapse)$/,
    /^(z-\d+|z-auto|-z-\d+)$/,
    /^(top|right|bottom|left|inset)(-|$)/,
    /^(float|clear)(-|$)/,
    /^(object-(contain|cover|fill|none|scale-down)|object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top))$/,
    /^(overflow|overscroll)(-|$)/,
    /^(box-(border|content))$/,
    /^(container)$/,
    /^(columns-)/,
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
  ],
  sizing: [
    /^(w-|min-w-|max-w-)/,
    /^(h-|min-h-|max-h-)/,
    /^(size-)/,
  ],
  typography: [
    /^(font-(sans|serif|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black))/,
    /^(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))/,
    /^(text-(left|center|right|justify|start|end))/,
    /^(text-(ellipsis|clip|transparent|current|inherit))/,
    /^(italic|not-italic)$/,
    /^(tracking-)/,
    /^(leading-)/,
    /^(list-)/,
    /^(underline|overline|line-through|no-underline)$/,
    /^(uppercase|lowercase|capitalize|normal-case)$/,
    /^(truncate)$/,
    /^(whitespace-)/,
    /^(break-)/,
  ],
  backgrounds: [
    /^(bg-(inherit|current|transparent|black|white|fixed|local|scroll))/,
    /^(bg-(clip|origin)-(border|padding|content|text))/,
    /^(bg-(bottom|center|left|right|top|repeat|auto|cover|contain))/,
    /^(bg-gradient-to-)/,
    /^(bg-)/,
    /^(from-|via-|to-)/,
  ],
  borders: [
    /^(rounded|rounded-(none|sm|md|lg|xl|2xl|3xl|full))/,
    /^(border|border-(0|2|4|8|solid|dashed|dotted|double|hidden|none))/,
    /^(divide-)/,
    /^(outline-)/,
    /^(ring-)/,
  ],
  effects: [
    /^(shadow|shadow-(sm|md|lg|xl|2xl|inner|none))/,
    /^(opacity-)/,
    /^(mix-blend-|bg-blend-)/,
  ],
  filters: [
    /^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop-)/,
  ],
  transitions: [
    /^(transition|duration-|ease-|delay-|animate-)/,
  ],
  transforms: [
    /^(scale-|rotate-|translate-|skew-|transform|origin-)/,
  ],
  interactivity: [
    /^(accent-|appearance-|cursor-|caret-|pointer-events-|resize-|scroll-|snap-|touch-|select-|will-change-)/,
  ],
  svg: [
    /^(fill-|stroke-)/,
  ],
  accessibility: [
    /^(sr-only|not-sr-only)$/,
  ],
  other: [],
};

const VARIANT_ORDER = [
  "sm", "md", "lg", "xl", "2xl", "hover", "focus", "active", "disabled", "dark"
];

// --- Helper Functions ---

function getBaseClass(className) {
  const isNegative = className.startsWith("-");
  const withoutNegative = isNegative ? className.slice(1) : className;
  const parts = withoutNegative.split(":");
  const baseClass = parts[parts.length - 1];
  return isNegative ? \`-\${baseClass}\` : baseClass;
}

function getVariants(className) {
  return className.split(":").slice(0, -1);
}

function getCategory(className) {
  const baseClass = getBaseClass(className);
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(baseClass)) return category;
    }
  }
  return "other";
}

function sortClassList(classes) {
  return [...classes].sort((a, b) => {
    const aVariants = getVariants(a);
    const bVariants = getVariants(b);
    if (aVariants.length !== bVariants.length) return aVariants.length - bVariants.length;
    if (aVariants.length > 0 && bVariants.length > 0) {
      const aOrder = VARIANT_ORDER.indexOf(aVariants[0]) === -1 ? 999 : VARIANT_ORDER.indexOf(aVariants[0]);
      const bOrder = VARIANT_ORDER.indexOf(bVariants[0]) === -1 ? 999 : VARIANT_ORDER.indexOf(bVariants[0]);
      if (aOrder !== bOrder) return aOrder - bOrder;
    }
    return getBaseClass(a).localeCompare(getBaseClass(b));
  });
}

function findConflicts(classes) {
  const conflicts = [];
  const propertyMap = new Map();
  for (const cls of classes) {
    const base = getBaseClass(cls);
    const variants = getVariants(cls).sort().join(":");
    const prop = base.split("-")[0] || base;
    const key = \`\${variants}:\${prop}\`;
    if (!propertyMap.has(key)) propertyMap.set(key, []);
    propertyMap.get(key).push(cls);
  }
  for (const [key, list] of propertyMap.entries()) {
    if (list.length > 1) {
      conflicts.push({ classes: list, type: key.split(":").pop() });
    }
  }
  return conflicts;
}

function performAudit(classes) {
  const audit = [];
  const baseClasses = classes.map(getBaseClass);
  const classSet = new Set(baseClasses);
  for (const cls of classes) {
    const base = getBaseClass(cls);
    if (base === "block" && classSet.has("flex")) {
      audit.push({ class: cls, reason: "'block' is redundant with 'flex'", severity: "low" });
    }
    if (base === "inline" && (base.includes("p-") || base.includes("m-"))) {
      audit.push({ class: cls, reason: "Padding/Margin on 'inline' is unreliable", severity: "medium" });
    }
  }
  return audit;
}

function analyzeBreakpoints(classes) {
  const breakpoints = { base: [], sm: [], md: [], lg: [], xl: [], "2xl": [] };
  for (const cls of classes) {
    const variants = getVariants(cls);
    const bp = variants.find(v => ["sm", "md", "lg", "xl", "2xl"].includes(v)) || "base";
    if (breakpoints[bp]) breakpoints[bp].push(cls);
  }
  return breakpoints;
}

self.onmessage = function(e) {
  try {
    const { input, config } = e.data;
    const classes = input.trim().split(/\s+/).filter(c => c.length > 0);
    const uniqueClasses = config.removeDuplicates ? [...new Set(classes)] : classes;
    
    const categorized = new Map();
    CATEGORY_ORDER.forEach(c => categorized.set(c, []));
    uniqueClasses.forEach(cls => {
      const cat = getCategory(cls);
      categorized.get(cat).push(cls);
    });

    if (config.sortWithinGroups) {
      for (const [cat, list] of categorized) {
        categorized.set(cat, sortClassList(list));
      }
    }

    const allClasses = [];
    CATEGORY_ORDER.forEach(cat => allClasses.push(...categorized.get(cat)));
    const output = allClasses.join(" ");

    const groups = CATEGORY_ORDER.map((cat, i) => ({
      id: cat,
      name: cat.toUpperCase(),
      classes: categorized.get(cat),
      order: i
    }));

    const result = {
      id: crypto.randomUUID(),
      output,
      stats: {
        totalClasses: classes.length,
        uniqueClasses: uniqueClasses.length,
        duplicatesRemoved: classes.length - uniqueClasses.length
      },
      groups,
      conflicts: findConflicts(uniqueClasses),
      audit: performAudit(uniqueClasses),
      breakpoints: analyzeBreakpoints(uniqueClasses),
      sortedAt: new Date().toISOString()
    };

    self.postMessage({ type: 'success', result });
  } catch (err) {
    self.postMessage({ type: 'error', error: err.message });
  }
};
`;
