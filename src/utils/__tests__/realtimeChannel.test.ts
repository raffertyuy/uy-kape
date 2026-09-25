import { describe, it, expect } from "vitest";
import { createChannelTopic } from "../realtimeChannel";

describe("createChannelTopic", () => {
  it("keeps the base topic as a readable prefix", () => {
    expect(createChannelTopic("drinks_changes")).toMatch(/^drinks_changes:\d+$/);
  });

  it("returns a different topic on every call for the same base", () => {
    const first = createChannelTopic("queue-updates");
    const second = createChannelTopic("queue-updates");
    expect(first).not.toBe(second);
  });

  it("never reuses a topic across different bases", () => {
    const topics = new Set(
      ["a", "b", "a", "c", "b"].map((base) => createChannelTopic(base)),
    );
    expect(topics.size).toBe(5);
  });
});
