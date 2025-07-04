import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { Gate } from "./Gate";
import type { Gate as GateCard } from "types/Gate";

vi.mock("helpers/resolveCards", () => ({
  resolveCards: (ids: string[], getter: (id: string) => GateCard) =>
    ids.map(getter),
}));

describe("Gate", () => {
  let deck: {
    draw: () => GateCard | null;
    discard: (card: GateCard) => void;
  };
  let state: {
    getGateIds: () => string[];
    setGateIds: (ids: string[]) => void;
    getGateById: (id: string) => GateCard | undefined;
  };
  let logger: {
    add: (event: string, payload: Record<string, any>) => void;
  };
  let gate: Gate;

  beforeEach(() => {
    deck = {
      draw: vi.fn(),
      discard: vi.fn(),
    };
    state = {
      getGateIds: vi.fn(),
      setGateIds: vi.fn(),
      getGateById: vi.fn(),
    };
    logger = {
      add: vi.fn(),
    };
    gate = new Gate(deck as any, state as any, logger as any);
    vi.clearAllMocks();
  });

  it("draw() возвращает null, если колода пуста", () => {
    (deck.draw as Mock).mockReturnValue(null);
    expect(gate.draw()).toBeNull();
    expect(state.setGateIds).not.toHaveBeenCalled();
    expect(logger.add).not.toHaveBeenCalled();
  });

  it("draw() берёт карту, обновляет state и логирует", () => {
    const card: GateCard = { id: "g1", location: "loc", color: "red" } as any;
    (deck.draw as Mock).mockReturnValue(card);
    (state.getGateIds as Mock).mockReturnValue(["g0"]);
    const result = gate.draw();
    expect(result).toBe("g1");
    expect(state.setGateIds).toHaveBeenCalledWith(["g0", "g1"]);
    expect(logger.add).toHaveBeenCalledWith("gate.draw", {
      gateId: "g1",
      gateLocation: "loc",
      gateColor: "red",
    });
  });

  it("discard() возвращает false, если id нет в state", () => {
    (state.getGateIds as Mock).mockReturnValue(["g1"]);
    expect(gate.discard("x")).toBe(false);
    expect(deck.discard).not.toHaveBeenCalled();
    expect(logger.add).not.toHaveBeenCalled();
  });

  it("discard() возвращает false, если state.getGateById вернул undefined", () => {
    (state.getGateIds as Mock).mockReturnValue(["g1"]);
    (state.getGateById as Mock).mockReturnValue(undefined);
    expect(gate.discard("g1")).toBe(false);
    expect(deck.discard).not.toHaveBeenCalled();
    expect(logger.add).not.toHaveBeenCalled();
  });

  it("discard() убирает карту из state, кладёт в discard-потомок и логирует", () => {
    const card: GateCard = { id: "g1", location: "loc", color: "blue" } as any;
    (state.getGateIds as Mock).mockReturnValue(["g1", "g2"]);
    (state.getGateById as Mock).mockReturnValue(card);
    expect(gate.discard("g1")).toBe(true);
    expect(state.setGateIds).toHaveBeenCalledWith(["g2"]);
    expect(deck.discard).toHaveBeenCalledWith(card);
    expect(logger.add).toHaveBeenCalledWith("gate.discard", {
      gateId: "g1",
      gateLocation: "loc",
      gateColor: "blue",
    });
  });

  it("getState() возвращает массив карт через resolveCards", () => {
    (state.getGateIds as Mock).mockReturnValue(["a", "b"]);
    (state.getGateById as Mock).mockImplementation(
      (id: string) => ({ id, location: id, color: id } as any)
    );
    const arr = gate.getState();
    expect(arr).toEqual([
      { id: "a", location: "a", color: "a" },
      { id: "b", location: "b", color: "b" },
    ]);
  });

  it("setState() вызывает state.setGateIds с копией массива", () => {
    gate.setState(["x", "y"]);
    expect(state.setGateIds).toHaveBeenCalledWith(["x", "y"]);
  });
});
