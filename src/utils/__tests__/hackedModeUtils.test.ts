import { describe, expect, it } from "vitest";
import { getHackedDrinkName, HACKED_PREFIX_LIST } from "../hackedModeUtils";

describe("hackedModeUtils", () => {
  describe("HACKED_PREFIX_LIST", () => {
    it("is a non-empty array of strings", () => {
      expect(Array.isArray(HACKED_PREFIX_LIST)).toBe(true);
      expect(HACKED_PREFIX_LIST.length).toBeGreaterThan(0);
      HACKED_PREFIX_LIST.forEach((prefix) => {
        expect(typeof prefix).toBe("string");
        expect(prefix.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getHackedDrinkName", () => {
    it("returns a string containing the original name", () => {
      const result = getHackedDrinkName("Espresso");
      expect(result).toContain("Espresso");
    });

    it("prepends a prefix from HACKED_PREFIX_LIST", () => {
      const originalName = "Cappuccino";
      const result = getHackedDrinkName(originalName);
      const hasKnownPrefix = Array.from(HACKED_PREFIX_LIST).some((prefix) =>
        result.startsWith(prefix)
      );
      expect(hasKnownPrefix).toBe(true);
    });

    it('formats as "<Prefix> <OriginalName>"', () => {
      const originalName = "Caffe Latte";
      const result = getHackedDrinkName(originalName);
      expect(result).toMatch(/^.+ Caffe Latte$/);
    });

    it("handles drink names with special characters", () => {
      const result = getHackedDrinkName("Black Coffee (V60)");
      expect(result).toContain("Black Coffee (V60)");
    });

    it("produces varied prefixes across multiple calls", () => {
      const results = Array.from(
        { length: 30 },
        () => getHackedDrinkName("Espresso"),
      );
      const prefixes = results.map((r) => r.replace(" Espresso", ""));
      const uniquePrefixes = new Set(prefixes);
      // With 12 prefixes and 30 calls, expect at least 3 distinct ones
      expect(uniquePrefixes.size).toBeGreaterThan(2);
    });
  });
});
