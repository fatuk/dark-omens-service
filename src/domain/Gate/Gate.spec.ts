import { describe, beforeEach, test, expect, vi } from "vitest";
import type { Gate as GateCard } from "types/Gate";
import { ILog } from "infrastructure/Log";
import { IGate } from "./IGate";
import { Gate } from "./Gate";
import { GateStateService } from "types/GateStateService";
import { getFakeGates } from "tests/helpers/getFakeGates";

describe("Domain Gate (unit)", () => {
  let state: GateStateService;
  let deck: { draw: () => GateCard | null; discard: (c: GateCard) => void };
  let logger: ILog;
  let svc: IGate;

  beforeEach(() => {
    const allGates = getFakeGates(5);
    let ids: string[] = [];

    state = {
      getGateIds: () => [...ids],
      setGateIds: (newIds: string[]) => {
        ids = [...newIds];
      },
      getGateById: (id: string) => allGates.find((g) => g.id === id),
    };

    deck = {
      draw: vi.fn(),
      discard: vi.fn(),
    };

    logger = {
      add: vi.fn(),
      get: vi.fn(() => []),
      clear: vi.fn(),
    };

    svc = new Gate(deck as any, state, logger);
  });

  test("draw возвращает ID новых врат и логирует", () => {
    const gates = getFakeGates(1);
    const gate = gates[0];
    (deck.draw as any).mockReturnValueOnce(gate);

    const result = svc.draw();
    expect(result).toBe(gates[0].id);
    expect(state.getGateIds()).toEqual([gate.id]);
    expect(logger.add).toHaveBeenCalledWith("gate.draw", {
      gateId: gate.id,
      gateLocation: gate.location,
      gateColor: gate.color,
    });
  });

  test("draw возвращает null, если колода пуста", () => {
    (deck.draw as any).mockReturnValue(null);
    const result = svc.draw();
    expect(result).toBeNull();
    expect(state.getGateIds()).toEqual([]);
    expect(logger.add).not.toHaveBeenCalled();
  });

  test("discard закрывает врата и логирует", () => {
    const gates = getFakeGates(2);
    state.setGateIds([gates[0].id, gates[1].id]);
    state.getGateById = (id: string) => gates.find((g) => g.id === id);

    const removed = svc.discard(gates[0].id);
    expect(removed).toBe(true);
    expect(state.getGateIds()).toEqual([gates[1].id]);
    expect(logger.add).toHaveBeenCalledWith("gate.discard", {
      gateId: gates[0].id,
      gateLocation: gates[0].location,
      gateColor: gates[0].color,
    });
  });

  test("discard возвращает false для несуществующего ID", () => {
    state.setGateIds(["x", "y"]);
    const removed = svc.discard("nonexistent");
    expect(removed).toBe(false);
    expect(logger.add).not.toHaveBeenCalled();
  });

  // test("getAll возвращает все валидные Gate[]", () => {
  //   const gates = getFakeGates(3);

  //   state.setGateIds(gates.map((g) => g.id));
  //   state.getGateById = (id) =>
  //     id === gates[1].id ? undefined : gates.find((g) => g.id === id);

  //   const all = svc.getAll();

  //   expect(all).toEqual([gates[0], gates[2]]);
  // });

  // test("restore восстанавливает заранее заданный список ID", () => {
  //   const gates = getFakeGates(3);
  //   state.getGateById = (id) => gates.find((g) => g.id === id);

  //   const restoreIds = [gates[2].id, gates[0].id];
  //   svc.restore(restoreIds);

  //   expect(state.getGateIds()).toEqual(restoreIds);
  //   const restored = svc.getAll();
  //   expect(restored).toEqual([gates[2], gates[0]]);
  // });
});
