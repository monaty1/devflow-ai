import { describe, it, expect } from "vitest";
import {
  sortClasses,
  isValidInput,
  countClasses,
  findDuplicates,
  EXAMPLE_INPUT,
  MESSY_EXAMPLE,
} from "@/lib/application/tailwind-sorter";
import { DEFAULT_SORTER_CONFIG } from "@/types/tailwind-sorter";

describe("Tailwind Sorter", () => {
  describe("sortClasses", () => {
    it("should sort classes by category", () => {
      const input = "text-red-500 flex p-4 bg-blue-500";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      // Layout (flex) should come before spacing (p-4)
      const classes = result.output.split(" ");
      const flexIndex = classes.indexOf("flex");
      const paddingIndex = classes.indexOf("p-4");

      expect(flexIndex).toBeLessThan(paddingIndex);
    });

    it("should remove duplicates when enabled", () => {
      const input = "flex flex p-4 p-4 text-red-500";
      const result = sortClasses(input, {
        ...DEFAULT_SORTER_CONFIG,
        removeDuplicates: true,
      });

      expect(result.stats.duplicatesRemoved).toBe(2);
      expect(result.stats.uniqueClasses).toBe(3);
    });

    it("should preserve duplicates when disabled", () => {
      const input = "flex flex p-4";
      const result = sortClasses(input, {
        ...DEFAULT_SORTER_CONFIG,
        removeDuplicates: false,
      });

      expect(result.stats.duplicatesRemoved).toBe(0);
      expect(result.output.split(" ").filter((c) => c === "flex").length).toBe(2);
    });

    it("should handle variant prefixes", () => {
      const input = "hover:bg-blue-500 bg-red-500 md:flex flex";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      // Classes without variants should come before classes with variants
      const classes = result.output.split(" ");
      const flexIndex = classes.indexOf("flex");
      const mdFlexIndex = classes.indexOf("md:flex");

      expect(flexIndex).toBeLessThan(mdFlexIndex);
    });

    it("should sort responsive variants correctly", () => {
      const input = "xl:flex lg:flex md:flex sm:flex flex";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const classes = result.output.split(" ");
      expect(classes[0]).toBe("flex");
      expect(classes[1]).toBe("sm:flex");
      expect(classes[2]).toBe("md:flex");
      expect(classes[3]).toBe("lg:flex");
      expect(classes[4]).toBe("xl:flex");
    });

    it("should group layout classes together", () => {
      const input = "text-lg flex hidden absolute p-4";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const layoutGroup = result.groups.find((g) => g.id === "layout");
      expect(layoutGroup?.classes).toContain("flex");
      expect(layoutGroup?.classes).toContain("hidden");
      expect(layoutGroup?.classes).toContain("absolute");
    });

    it("should group spacing classes together", () => {
      const input = "m-4 p-2 mt-8 px-6 gap-4 mb-2";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const spacingGroup = result.groups.find((g) => g.id === "spacing");
      expect(spacingGroup?.classes).toContain("m-4");
      expect(spacingGroup?.classes).toContain("p-2");
      expect(spacingGroup?.classes).toContain("mt-8");
    });

    it("should handle negative values", () => {
      const input = "-mt-4 mt-4 -translate-x-1/2";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      expect(result.output).toContain("-mt-4");
      expect(result.output).toContain("-translate-x-1/2");
    });

    it("should format output as multi-line when configured", () => {
      const input = "flex p-4 text-lg";
      const result = sortClasses(input, {
        ...DEFAULT_SORTER_CONFIG,
        outputFormat: "multi-line",
      });

      expect(result.output).toContain("\n");
    });

    it("should format output as grouped when configured", () => {
      const input = "flex p-4 text-lg bg-blue-500";
      const result = sortClasses(input, {
        ...DEFAULT_SORTER_CONFIG,
        outputFormat: "grouped",
      });

      expect(result.output).toContain("/*");
      expect(result.output).toContain("*/");
    });

    it("should calculate correct stats", () => {
      const input = "flex flex p-4 text-lg bg-blue-500 p-4";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      expect(result.stats.totalClasses).toBe(6);
      expect(result.stats.uniqueClasses).toBe(4);
      expect(result.stats.duplicatesRemoved).toBe(2);
    });
  });

  describe("isValidInput", () => {
    it("should return true for valid class input", () => {
      expect(isValidInput("flex p-4")).toBe(true);
      expect(isValidInput("text-lg")).toBe(true);
      expect(isValidInput("hover:bg-blue-500")).toBe(true);
    });

    it("should return false for empty input", () => {
      expect(isValidInput("")).toBe(false);
      expect(isValidInput("   ")).toBe(false);
    });
  });

  describe("countClasses", () => {
    it("should count classes correctly", () => {
      expect(countClasses("flex p-4 text-lg")).toBe(3);
      expect(countClasses("flex")).toBe(1);
      expect(countClasses("flex  p-4   text-lg")).toBe(3); // Extra spaces
    });

    it("should return 0 for empty input", () => {
      expect(countClasses("")).toBe(0);
      expect(countClasses("   ")).toBe(0);
    });
  });

  describe("findDuplicates", () => {
    it("should find duplicate classes", () => {
      const duplicates = findDuplicates("flex flex p-4 p-4 p-4 text-lg");

      expect(duplicates).toContain("flex");
      expect(duplicates).toContain("p-4");
      expect(duplicates).not.toContain("text-lg");
    });

    it("should return empty array when no duplicates", () => {
      const duplicates = findDuplicates("flex p-4 text-lg");

      expect(duplicates).toHaveLength(0);
    });
  });

  describe("Category detection", () => {
    it("should detect layout classes", () => {
      const input = "block inline-block flex grid hidden visible absolute relative fixed sticky";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const layoutGroup = result.groups.find((g) => g.id === "layout");
      expect(layoutGroup?.classes.length).toBe(10);
    });

    it("should detect flexbox/grid classes", () => {
      const input = "flex-row flex-col items-center justify-between gap-4 grid-cols-3";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const flexGroup = result.groups.find((g) => g.id === "flexbox-grid");
      expect(flexGroup?.classes.length).toBeGreaterThan(0);
    });

    it("should detect typography classes", () => {
      const input = "text-lg font-bold italic uppercase tracking-wide leading-relaxed";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const typoGroup = result.groups.find((g) => g.id === "typography");
      expect(typoGroup?.classes.length).toBe(6);
    });

    it("should detect background classes", () => {
      const input = "bg-blue-500 bg-opacity-50 bg-gradient-to-r from-blue-500 to-purple-500";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const bgGroup = result.groups.find((g) => g.id === "backgrounds");
      expect(bgGroup?.classes.length).toBeGreaterThan(0);
    });

    it("should detect border classes", () => {
      const input = "border border-2 border-blue-500 rounded-lg ring-2 ring-blue-500";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const borderGroup = result.groups.find((g) => g.id === "borders");
      expect(borderGroup?.classes.length).toBeGreaterThan(0);
    });

    it("should detect effect classes", () => {
      const input = "shadow-lg shadow-blue-500/50 opacity-75";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const effectGroup = result.groups.find((g) => g.id === "effects");
      expect(effectGroup?.classes.length).toBeGreaterThan(0);
    });

    it("should detect transition classes", () => {
      const input = "transition duration-300 ease-in-out animate-spin";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      const transitionGroup = result.groups.find((g) => g.id === "transitions");
      expect(transitionGroup?.classes.length).toBe(4);
    });
  });

  describe("Example inputs", () => {
    it("should sort EXAMPLE_INPUT correctly", () => {
      const result = sortClasses(EXAMPLE_INPUT, DEFAULT_SORTER_CONFIG);

      expect(result.stats.totalClasses).toBeGreaterThan(0);
      expect(result.output.length).toBeGreaterThan(0);
    });

    it("should handle MESSY_EXAMPLE with duplicates", () => {
      const result = sortClasses(MESSY_EXAMPLE, DEFAULT_SORTER_CONFIG);

      expect(result.stats.duplicatesRemoved).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle arbitrary values", () => {
      const input = "w-[100px] h-[50vh] text-[#ff0000] bg-[url('/img.png')]";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      expect(result.stats.totalClasses).toBe(4);
    });

    it("should handle important modifier", () => {
      const input = "!p-4 !important:flex";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      expect(result.output).toContain("!p-4");
    });

    it("should handle multiple variants", () => {
      const input = "dark:hover:bg-blue-500 md:hover:text-lg";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      expect(result.stats.totalClasses).toBe(2);
    });

    it("should handle group and peer variants", () => {
      const input = "group-hover:opacity-100 peer-focus:ring-2";
      const result = sortClasses(input, DEFAULT_SORTER_CONFIG);

      expect(result.stats.totalClasses).toBe(2);
    });
  });
});
