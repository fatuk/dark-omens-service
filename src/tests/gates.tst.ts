import { GameService } from "services/GameService";
import { describe, beforeEach, test, expect } from "vitest";
import { initTestGame } from "./helpers/initTestGame";

describe("Gate mechanics", () => {
  let game: GameService;

  beforeEach(async () => {
    game = await initTestGame();
  });

  test("drawGate добавляет врата по location и возвращает карту", () => {
    const gate = game.drawGate();
    expect(gate).toBeTruthy();
    expect(game.getState().openGates).toContain(gate?.location);
    expect(game.getState().log).toContain(
      `Открылись врата в ${gate?.location} (${gate?.color})`
    );
  });

  test("getState возвращает корректные Gate карты", () => {
    const gate = game.drawGate()!;
    const globalState = game.getState();
    expect(globalState.openGates).toContain(gate.location);
  });

  test("getOpenedGatesState возвращает корректные Gate карты", () => {
    const gate = game.drawGate()!;
    const openedGates = game.getOpenedGatesState();

    expect(openedGates.length).toBe(1);
    expect(openedGates[0].location).toBe(gate.location);
  });

  test("closeGate удаляет врата по локации", () => {
    const gate = game.drawGate()!;
    const closed = game.closeGate(gate.location);
    expect(closed).toBe(true);
    expect(game.getState().openGates).not.toContain(gate.location);
    expect(game.getState().log).toContain(
      `Врата в ${gate.location} были закрыты`
    );
  });

  test("closeGate с несуществующей локацией возвращает false", () => {
    const result = game.closeGate("nonexistent-location");
    expect(result).toBe(false);
  });
});
