import { describe, beforeEach, test, expect, vi } from "vitest";
import { Log } from "./Log";

describe("Log", () => {
  let logger: Log;

  beforeEach(() => {
    logger = new Log();
    vi.restoreAllMocks();
  });

  test("add() записывает сообщение с временной меткой", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue(
      "2025-01-01 12:00:00"
    );

    logger.add("Hello World");

    const entries = logger.get();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toBe("[2025-01-01 12:00:00] Hello World");
  });

  test("get() возвращает копию массива, а не оригинал", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue("T");
    logger.add("Msg");
    const first = logger.get();
    first.push("mutated");

    const second = logger.get();
    expect(second).toEqual(["[T] Msg"]);
  });

  test("clear() очищает весь лог", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue("X");
    logger.add("A");
    expect(logger.get()).toHaveLength(1);

    logger.clear();
    expect(logger.get()).toHaveLength(0);
  });
});
