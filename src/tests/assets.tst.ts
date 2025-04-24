import { GameService } from "services/GameService";
import { describe, beforeEach, test, expect } from "vitest";
import { initTestGame } from "./helpers/initTestGame";

describe("Asset mechanics", () => {
  let game: GameService;

  beforeEach(async () => {
    game = await initTestGame();
  });

  test("replenishMarket наполняет маркет до 4 карт", () => {
    game.replenishMarket();
    const market = game.getMarketState();
    expect(market.length).toBe(4);
  });

  test("buyFromMarket удаляет карту и возвращает её", () => {
    game.replenishMarket();
    const card = game.getMarketState()[0];
    const bought = game.buyFromMarket(card.id);
    expect(bought?.id).toBe(card.id);
    expect(game.getMarketState().length).toBe(4);
  });

  test("buyFromMarket с несуществующим id возвращает null", () => {
    const result = game.buyFromMarket("non-existent");
    expect(result).toBeNull();
  });

  test("discardCard удаляет ассет и логирует", () => {
    const card = game.drawCard("asset")!;
    game.discardCard("asset", card);
    const assetDiscardPile = game.getState().decks.asset.discardPile;
    expect(assetDiscardPile).toContain(card.id);
    expect(game.getState().decks.asset.drawPile).not.toContain(card.id);
    const log = game.getLog();
    expect(log.at(-1)).toMatch(`Сброшена карта: ${card.name}`);
  });

  test("drawCard вытягивает карту ассета и логирует", () => {
    const card = game.drawCard("asset");
    expect(card).toBeTruthy();
    expect(game.getLog().at(-1)).toMatch(`Вытянута карта: ${card!.name}`);
  });

  test("shuffleDeck перемешивает колоду ассетов и логирует", () => {
    game.shuffleDeck("asset");
    const log = game.getLog();
    expect(log.at(-1)).toMatch("Перемешана колода: asset");
  });
});
