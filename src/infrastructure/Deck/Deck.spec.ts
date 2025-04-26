import { describe, it, expect, beforeEach, vi } from "vitest";
import { Deck } from "infrastructure/Deck";
import type { DeckManagerState } from "types/DeckManagerState";
import type { Asset } from "types/Asset";
import { getFakeAssets } from "tests/helpers/getFakeAsset";

describe("Infrastructure Deck (unit)", () => {
  let assets: Asset[];
  let db: Map<string, Asset>;
  let deck: Deck<Asset>;

  beforeEach(() => {
    assets = getFakeAssets(5);
    db = new Map(assets.map((a) => [a.id, a]));
    deck = new Deck<Asset>(db);

    vi.spyOn(deck as any, "shuffle").mockImplementation((arr: any) => [...arr]);
  });

  it("initialize задаёт drawPile и очищает остальные стопки", () => {
    deck.initialize(assets);
    const state = deck.getState();
    expect(state.drawPile).toEqual(assets.map((a) => a.id));
    expect(state.discardPile).toEqual([]);
    expect(state.removedFromGame).toEqual([]);
  });

  it("draw вытягивает по одной карте, потом возвращает null", () => {
    deck.initialize(assets);
    const drawn: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const c = deck.draw();
      expect(c).not.toBeNull();
      drawn.push(c!.id);
    }
    expect(drawn).toEqual(assets.map((a) => a.id).reverse());
    expect(deck.draw()).toBeNull();
  });

  it("draw берёт из discardPile, когда drawPile пуст", () => {
    deck.initialize([]);
    deck.discard(assets[0]);
    expect(deck.draw()).toEqual(assets[0]);
    expect(deck.draw()).toBeNull();
  });

  it("discard добавляет карту в discardPile", () => {
    deck.initialize([]);
    deck.discard(assets[1]);
    const state = deck.getState();
    expect(state.discardPile).toEqual([assets[1].id]);
  });

  it("removeFromGame добавляет карту в removedFromGame", () => {
    deck.initialize([]);
    deck.removeFromGame(assets[2]);
    const state = deck.getState();
    expect(state.removedFromGame).toEqual([assets[2].id]);
  });

  it("shuffleDrawPile вызывает shuffle на drawPile", () => {
    deck.initialize(assets);
    const spy = vi.spyOn(deck as any, "shuffle");
    deck.shuffleDrawPile();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.arrayContaining(assets));
  });

  it("drawByType удаляет и возвращает первую карту заданного type", () => {
    assets[0].type = "asset";
    assets[1].type = "clue";
    assets[2].type = "condition";
    deck.initialize(assets);
    const firstAsset = deck.drawByType("asset");
    expect(firstAsset).not.toBeNull();
    expect(firstAsset!.type).toBe("asset");
    expect(deck.drawByType(firstAsset!.type)).not.toEqual(firstAsset);
  });

  it("peek не изменяет стейт и возвращает верхние count карт", () => {
    deck.initialize(assets);
    const top2 = deck.peek(2);
    expect(top2.map((a) => a.id)).toEqual(assets.slice(-2).map((a) => a.id));
    expect(deck.getState().drawPile).toEqual(assets.map((a) => a.id));
  });

  it("returnToTop и returnToBottom корректно помещают карту в стопку", () => {
    deck.initialize(assets);
    const extra: Asset = { ...assets[0], id: "extra-1" };
    deck.returnToTop(extra);
    expect(deck.peek(1)[0].id).toBe("extra-1");
    deck.returnToBottom(extra);
    expect(deck.getState().drawPile[0]).toBe("extra-1");
  });

  it("getCardById возвращает карту из БД или null", () => {
    expect(deck.getCardById(assets[3].id)).toEqual(assets[3]);
    expect(deck.getCardById("no-such-id")).toBeNull();
  });

  it("restoreFromState и getState зеркальны", () => {
    const saved: DeckManagerState = {
      drawPile: [assets[0].id, assets[1].id],
      discardPile: [assets[2].id],
      removedFromGame: [assets[3].id, assets[4].id],
    };
    deck.restoreFromState(saved);
    expect(deck.getState()).toEqual(saved);
  });

  it("restoreFromState кидает, если ID нет в БД", () => {
    const bad: DeckManagerState = {
      drawPile: ["missing"],
      discardPile: [],
      removedFromGame: [],
    };
    expect(() => deck.restoreFromState(bad)).toThrowError(/Card not found/);
  });
});
