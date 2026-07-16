import { describe, test, expect } from "vitest";
import { formatCurrency } from "../utils/gamification.js";

describe("formatCurrency", () => {
  test("formats a positive number as USD", () => {
    expect(formatCurrency(42.5)).toBe("$42.50");
  });
  test("treats undefined as 0", () => {
    expect(formatCurrency(undefined)).toBe("$0.00");
  });
});
