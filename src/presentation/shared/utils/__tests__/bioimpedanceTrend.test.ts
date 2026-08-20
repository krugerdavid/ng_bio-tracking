import { describe, expect, it } from "vitest";
import { getTrendIndicator } from "../bioimpedanceTrend";

describe("getTrendIndicator", () => {
  it("marks an increase as up", () => {
    expect(getTrendIndicator(10, 8)).toEqual({ direction: "up" });
  });

  it("marks a decrease as down", () => {
    expect(getTrendIndicator(8, 10)).toEqual({ direction: "down" });
  });

  it("returns null when values are missing or almost equal", () => {
    expect(getTrendIndicator(undefined, 10)).toBeNull();
    expect(getTrendIndicator(10, null)).toBeNull();
    expect(getTrendIndicator(10.004, 10)).toBeNull();
  });
});
