import { describe, beforeEach, test, expect, vi } from "vitest";
import { Log } from "./Log";
import type { LogEntry, LogParams } from "types/Log";
import { ILogState } from "./ILogState";

describe("Log", () => {
  let logger: Log;
  let stateMethods: ILogState;
  let state: LogEntry[] = [];

  beforeEach(() => {
    state = [];
    stateMethods = {
      getState: () => [...state],
      setState: (newState: LogEntry[]) => {
        state = [...newState];
      },
      add: (entry: LogEntry) => {
        state.push(entry);
      },
    };
    logger = new Log(stateMethods);
    vi.restoreAllMocks();
  });

  test("add() сохраняет запись с ключом и временной меткой без params", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue(
      "2025-01-01 12:00:00"
    );

    logger.add("event.key");

    const entries = logger.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual<LogEntry>({
      key: "event.key",
      params: undefined,
      timestamp: "2025-01-01 12:00:00",
    });
  });

  test("add() сохраняет запись с ключом, параметрами и временной меткой", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue(
      "2025-02-02 13:00:00"
    );
    const params: LogParams = { foo: "bar" };

    logger.add("event.with.params", params);

    const entries = logger.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual<LogEntry>({
      key: "event.with.params",
      params,
      timestamp: "2025-02-02 13:00:00",
    });
  });

  test("getState() возвращает копию массива, а не оригинал", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue("T");
    logger.add("Msg");

    const first = logger.getState();
    first.push({ key: "hax", params: undefined, timestamp: "X" });

    const second = logger.getState();
    expect(second).toHaveLength(1);
    expect(second[0]).toEqual<LogEntry>({
      key: "Msg",
      params: undefined,
      timestamp: "T",
    });
  });

  test("clear() очищает весь лог", () => {
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue("X");
    logger.add("A");

    expect(logger.getState()).toHaveLength(1);

    logger.setState([]);
    expect(logger.getState()).toHaveLength(0);
  });
});
