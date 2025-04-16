import { GameService } from "services/GameService";
import { describe, beforeEach, test, expect } from "vitest";
import { initTestGame } from "./helpers/initTestGame";

describe("Clues mechanics", () => {
  let game: GameService;

  beforeEach(async () => {
    game = await initTestGame();
  });

  test("Добавление улики на карту", () => {
    const clue = game.drawClue();
    expect(clue).not.toBeNull();
    const cluesState = game.getCluesState();
    expect(cluesState.length).toBe(1);
    expect(cluesState[0].id).toBe(clue);
  });

  test("Добавление нескольких улик", () => {
    const first = game.drawClue();
    const second = game.drawClue();
    const clues = game.getCluesState();
    expect(clues.length).toBe(2);
    expect(clues.map((c) => c.id)).toContain(first);
    expect(clues.map((c) => c.id)).toContain(second);
  });

  test("Сброс улики", () => {
    const clue = game.drawClue()!;
    const success = game.discardClue(clue);
    expect(success).toBe(true);
    expect(game.getCluesState()).toHaveLength(0);
  });

  test("Сброс несуществующей улики", () => {
    const result = game.discardClue("fake-id");
    expect(result).toBe(false);
  });

  test("Clues отражаются в getState()", () => {
    const clue = game.drawClue();
    const state = game.getState();
    expect(state.clues).toContain(clue);
  });

  test("shuffleDeck перемешивает колоду clues и логирует", () => {
    game.shuffleDeck("clue");
    const log = game.getLog();
    expect(log.at(-1)).toMatch("Перемешана колода: clue");
  });
});
