import { describe, it, expect } from "vitest";
import { canonicalJson } from "@/lib/utils/json";

describe("canonicalJson", () => {
  it("sorts keys lexicographically", () => {
    const obj = { zebra: 1, apple: 2, mango: 3 };
    const result = canonicalJson(obj);
    const text = new TextDecoder().decode(result);
    const parsed = JSON.parse(text);
    expect(Object.keys(parsed)).toEqual(["apple", "mango", "zebra"]);
  });

  it("handles nested objects", () => {
    const obj = { b: { d: 1, c: 2 }, a: 1 };
    const result = canonicalJson(obj);
    const text = new TextDecoder().decode(result);
    const parsed = JSON.parse(text);
    expect(Object.keys(parsed)).toEqual(["a", "b"]);
    expect(Object.keys(parsed.b)).toEqual(["c", "d"]);
  });
});
