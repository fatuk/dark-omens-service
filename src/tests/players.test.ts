import { GameService } from "services/GameService";
import { describe, beforeEach, test, expect } from "vitest";
import { initTestGame } from "./helpers/initTestGame";

describe("Player mechanics", () => {
  let game: GameService;

  beforeEach(async () => {
    game = await initTestGame();
  });

  test("getPlayerState возвращает игрока с ассетами и состояниями", () => {
    const playerId = game.getState().players[0].id;
    const player = game.getPlayerState(playerId);
    expect(player).toBeTruthy();
    expect(player!.id).toBe(playerId);
    expect(player!.assets).toBeInstanceOf(Array);
    expect(player!.conditions).toBeInstanceOf(Array);
  });

  test("nextInvestigator переключает активного игрока", () => {
    const first = game.getState().turn.currentInvestigatorId;
    game.nextInvestigator();
    const second = game.getState().turn.currentInvestigatorId;
    expect(second).not.toBe(first);
  });

  test("passLeadInvestigator передаёт лидерство следующему игроку", () => {
    const initial = game.getState().turn.leadInvestigatorId;
    game.passLeadInvestigator();
    const updated = game.getState().turn.leadInvestigatorId;
    expect(updated).not.toBe(initial);
  });

  test("resetActions сбрасывает действия у всех игроков", () => {
    const player1Id = game.getState().players[0].id;
    const player2Id = game.getState().players[1].id;
    game.recordAction(player1Id, "move");
    game.recordAction(player2Id, "rest");
    expect(game.getPlayerState(player1Id)!.actionsTaken).toEqual(["move"]);
    expect(game.getPlayerState(player2Id)!.actionsTaken).toEqual(["rest"]);
    game.resetActions();
    const state1 = game.getPlayerState(player1Id)!;
    const state2 = game.getPlayerState(player2Id)!;
    expect(state1.actionsTaken).toEqual([]);
    expect(state2.actionsTaken).toEqual([]);
  });
});
