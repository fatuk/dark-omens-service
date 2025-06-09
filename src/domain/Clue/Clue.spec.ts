import { describe, beforeEach, test, expect, vi } from "vitest";
import type { Clue as ClueCard } from "types/Clue";
import { ILog } from "infrastructure/Log";
import { getFakeClues } from "tests/helpers/getFakeClues";
import { IClue } from "./IClue";
import { Clue } from "./Clue";
import { IClueState } from "./IClueState";
import { testLog } from "tests/testLog";

describe("Domain Clue (unit)", () => {
  let state: IClueState;
  let deck: { draw: () => ClueCard | null; discard: (c: ClueCard) => void };
  let logger: ILog;
  let svc: IClue;

  beforeEach(() => {
    vi.clearAllMocks();
    const allClues = getFakeClues(2);
    let ids: string[] = allClues.map((c) => c.id);

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

    logger = testLog;

    svc = new Clue(deck as any, state, logger);
  });

  test("draw возвращает ID новой улики и логирует", () => {
    const clues = getFakeClues(1);
    (deck.draw as any).mockReturnValueOnce(clues[0]);

    const result = svc.draw();
    expect(result).toBe(clues[0].id);
    expect(logger.add).toHaveBeenCalledWith("clue.draw", {
      clueId: clues[0].id,
      clueLocation: clues[0].location,
    });
  });

  test("draw возвращает null, если колода пуста", () => {
    (deck.draw as any).mockReturnValue(null);

    const result = svc.draw();
    expect(result).toBeNull();
    expect(logger.add).not.toHaveBeenCalled();
  });

  test("discard удаляет улику и логирует", () => {
    const clues = getFakeClues(2);
    state.setClueIds([clues[0].id, clues[1].id]);
    state.getClueById = (id: string) => clues.find((c) => c.id === id);

    const removed = svc.discard(clues[0].id);
    expect(removed).toBe(true);
    expect(state.getClueIds()).toEqual([clues[1].id]);
    expect(logger.add).toHaveBeenCalledWith("clue.discard", {
      clueId: clues[0].id,
      clueLocation: clues[0].location,
    });
  });

  test("discard возвращает false для несуществующего ID", () => {
    state.setClueIds(["x", "y"]);
    const removed = svc.discard("nonexistent");
    expect(removed).toBe(false);
    expect(logger.add).not.toHaveBeenCalled();
  });

  test("getState возвращает все валидные Clue[]", () => {
    const clues = getFakeClues(3);
    state.setClueIds(clues.map((c) => c.id));
    state.getClueById = (id: string) =>
      id === clues[1].id ? undefined : clues.find((c) => c.id === id);

    const all = svc.getState();
    expect(all).toEqual([clues[0], clues[2]]);
  });

  test("setState восстанавливает заранее заданный список ID", () => {
    const clues = getFakeClues(3);
    state.getClueById = (id: string) => clues.find((c) => c.id === id);

    const restoreIds = [clues[2].id, clues[0].id];
    svc.setState(restoreIds);

    expect(state.getClueIds()).toEqual(restoreIds);
    const restored = svc.getState();
    expect(restored).toEqual([clues[2], clues[0]]);
  });
});
