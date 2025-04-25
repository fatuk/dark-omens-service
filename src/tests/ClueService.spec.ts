import { describe, beforeEach, test, expect, vi } from "vitest";
import { ClueService } from "services/ClueService";
import type { ILogService } from "types/ILogService";
import type { Clue } from "types/Clue";
import { getFakeClues } from "./helpers/getFakeClues";
import { ClueStateService } from "types/ClueStateService";

describe("ClueService (unit)", () => {
  let state: ClueStateService;
  let deck: { draw: () => Clue | null; discard: (c: Clue) => void };
  let logger: ILogService;
  let svc: ClueService;

  beforeEach(() => {
    const allClues = getFakeClues(5);
    let ids: string[] = [];

    state = {
      getClueIds: () => [...ids],
      setClueIds: (newIds: string[]) => {
        ids = [...newIds];
      },
      getClueById: (id: string) => allClues.find((c) => c.id === id),
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

    svc = new ClueService(deck as any, state, logger);
  });

  test("draw возвращает ID новой улики и логирует", () => {
    const clues = getFakeClues(1);
    (deck.draw as any).mockReturnValueOnce(clues[0]);

    const result = svc.draw();
    expect(result).toBe(clues[0].id);
    expect(state.getClueIds()).toEqual([clues[0].id]);
    expect(logger.add).toHaveBeenCalledWith(`Выложена улика: ${clues[0].name}`);
  });

  test("draw возвращает null, если колода пуста", () => {
    (deck.draw as any).mockReturnValue(null);
    const result = svc.draw();
    expect(result).toBeNull();
    expect(state.getClueIds()).toEqual([]);
    expect(logger.add).not.toHaveBeenCalled();
  });

  test("discard удаляет улику и логирует", () => {
    const clues = getFakeClues(2);
    state.setClueIds([clues[0].id, clues[1].id]);

    const removed = svc.discard(clues[0].id);
    expect(removed).toBe(true);
    expect(state.getClueIds()).toEqual([clues[1].id]);
    expect(logger.add).toHaveBeenCalledWith(`Улика ${clues[0].id} сброшена`);
  });

  test("discard возвращает false для несуществующего ID", () => {
    state.setClueIds(["x", "y"]);
    const removed = svc.discard("nonexistent");
    expect(removed).toBe(false);
    expect(logger.add).not.toHaveBeenCalled();
  });

  test("getAll возвращает все валидные Clue[]", () => {
    const clues = getFakeClues(3);
    state.setClueIds(clues.map((c) => c.id));
    state.getClueById = (id) =>
      id === clues[1].id ? undefined : clues.find((c) => c.id === id);

    const all = svc.getAll();
    expect(all).toEqual([clues[0], clues[2]]);
  });

  test("restore восстанавливает заранее заданный список ID", () => {
    const clues = getFakeClues(3);
    state.getClueById = (id) => clues.find((c) => c.id === id);

    const restoreIds = [clues[2].id, clues[0].id];
    svc.restore(restoreIds);

    expect(state.getClueIds()).toEqual(restoreIds);
    const restored = svc.getAll();
    expect(restored).toEqual([clues[2], clues[0]]);
  });
});
