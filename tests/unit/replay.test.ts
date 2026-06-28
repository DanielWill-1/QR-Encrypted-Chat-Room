import { describe, it, expect } from "vitest";
import { ReplayWindow } from "@/lib/protocol/replay";

describe("ReplayWindow", () => {
  it("accepts first sequence number", () => {
    const rw = new ReplayWindow();
    expect(rw.check(1)).toBe(true);
  });

  it("rejects duplicate sequence numbers", () => {
    const rw = new ReplayWindow();
    expect(rw.check(1)).toBe(true);
    expect(rw.check(1)).toBe(false);
  });

  it("slides window forward", () => {
    const rw = new ReplayWindow();
    expect(rw.check(1)).toBe(true);
    expect(rw.check(2000)).toBe(true);
    expect(rw.check(500)).toBe(false);
  });
});
