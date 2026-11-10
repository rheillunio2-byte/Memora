import { describe, it, expect } from "vitest";
import { schedule, QUALITY } from "../src/lib/srs";

describe("SM-2-inspired scheduling", () => {
  it("resets repetitions after a failed recall", () => expect(schedule(1, 3, 12, 2.5)).toMatchObject({ reps: 0, interval: 1 }));
  it("uses one day for first successful recall", () => expect(schedule(4, 0, 0, 2.5)).toMatchObject({ reps: 1, interval: 1 }));
  it("uses six days for second successful recall", () => expect(schedule(4, 1, 1, 2.5)).toMatchObject({ reps: 2, interval: 6 }));
  it("multiplies the interval by ease afterwards", () => expect(schedule(4, 2, 6, 2.5).interval).toBe(15));
  it("keeps ease within 1.3 and 2.8", () => {
    expect(schedule(QUALITY.again, 0, 0, 1.3).ease).toBe(1.3);
    expect(schedule(QUALITY.easy, 5, 30, 2.8).ease).toBe(2.8);
  });
});
