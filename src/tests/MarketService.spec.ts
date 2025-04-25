import { MarketService } from "services/MarketService";
import { Asset } from "types/Asset";
import { ILogService } from "types/ILogService";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getFakeAssets } from "./helpers/getFakeAsset";
import { MarketStateService } from "types/MarketStateService";

describe("MarketService (unit)", () => {
  let state: MarketStateService;
  let deck: { draw: () => Asset | null; discard: (a: Asset) => void };
  let logService: ILogService;
  let svc: MarketService;

  beforeEach(() => {
    const allAssets = getFakeAssets(5);
    let ids: string[] = [];

    state = {
      getMarketIds: () => [...ids],
      setMarketIds: (newIds) => {
        ids = [...newIds];
      },
      getAssetById: (id) => allAssets.find((a) => a.id === id),
    };

    deck = {
      draw: vi.fn(),
      discard: vi.fn(),
    };

    logService = {
      add: vi.fn(),
      get: vi.fn(() => []),
      clear: vi.fn(),
    };

    svc = new MarketService(deck as any, state, logService, 3);
  });

  test("replenish наполняет маркет до maxSize и логирует каждую карту", () => {
    const assets = getFakeAssets(3);
    (deck.draw as any)
      .mockReturnValueOnce(assets[0])
      .mockReturnValueOnce(assets[1])
      .mockReturnValueOnce(assets[2])
      .mockReturnValueOnce(null);

    svc.replenish();

    expect(state.getMarketIds()).toEqual([
      assets[0].id,
      assets[1].id,
      assets[2].id,
    ]);
    expect(deck.draw).toHaveBeenCalledTimes(3);
    expect(logService.add).toHaveBeenCalledTimes(3);
    expect(logService.add).toHaveBeenCalledWith(
      `Добавлена карта в маркет: ${assets[0].name}`
    );
  });

  test("buy возвращает null если нет такой карты", () => {
    expect(svc.buy("non-existent")).toBeNull();
    expect(logService.add).not.toHaveBeenCalled();
  });

  test("buy удаляет карту, логирует и вызывает replenish", () => {
    const assets = getFakeAssets(2);
    state.setMarketIds([assets[0].id, assets[1].id]);
    (state.getAssetById as any) = (id: string) =>
      assets.find((a) => a.id === id) || undefined;

    const replenishSpy = vi.spyOn(svc, "replenish");
    const result = svc.buy(assets[0].id);

    expect(result).toEqual(assets[0]);
    expect(state.getMarketIds()).toEqual([assets[1].id]);
    expect(logService.add).toHaveBeenCalledWith(
      `Куплена карта: ${assets[0].name}`
    );
    expect(replenishSpy).toHaveBeenCalled();
  });

  test("discard сбрасывает asset в deck и логирует", () => {
    const [asset] = getFakeAssets(1);
    svc.discard(asset);
    expect(deck.discard).toHaveBeenCalledWith(asset);
    expect(logService.add).toHaveBeenCalledWith(
      `Карта сброшена в маркет: ${asset.name}`
    );
  });

  test("getAll возвращает только валидные Asset[]", () => {
    const assets = getFakeAssets(3);
    state.setMarketIds(assets.map((a) => a.id));
    state.getAssetById = (id) =>
      id === assets[1].id ? undefined : assets.find((a) => a.id === id);

    const all = svc.getAll();
    expect(all).toEqual([assets[0], assets[2]]);
  });

  test("restore восстанавливает заранее заданный список ID", () => {
    const assets = getFakeAssets(3);
    state.getAssetById = (id) => assets.find((a) => a.id === id);

    const restoreIds = [assets[2].id, assets[0].id];
    svc.restore(restoreIds);

    expect(state.getMarketIds()).toEqual(restoreIds);

    const restored = svc.getAll();

    expect(restored).toEqual([assets[2], assets[0]]);
  });
});
