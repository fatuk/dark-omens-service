import { Asset } from "types/Asset";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MarketStateService } from "types/MarketStateService";
import { ILog } from "infrastructure/Log";
import { IMarket } from "./IMarket";
import { getFakeAssets } from "tests/helpers/getFakeAsset";
import { Market } from "./Market";

describe("Domain Market (unit)", () => {
  let state: MarketStateService;
  let deck: { draw: () => Asset | null; discard: (a: Asset) => void };
  let logService: ILog;
  let svc: IMarket;

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

    svc = new Market(deck as any, state, logService, 3);
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
    expect(logService.add).toHaveBeenCalledWith("market.asset.replenish", {
      assetId: assets[0].id,
      assetName: assets[0].name,
    });
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
    expect(logService.add).toHaveBeenCalledWith("market.asset.buy", {
      assetId: assets[0].id,
      assetName: assets[0].name,
    });
    expect(replenishSpy).toHaveBeenCalled();
  });

  test("discard сбрасывает asset в deck и логирует", () => {
    const [asset] = getFakeAssets(1);
    svc.discard(asset);
    expect(deck.discard).toHaveBeenCalledWith(asset);
    expect(logService.add).toHaveBeenCalledWith("market.asset.discard", {
      assetId: asset.id,
      assetName: asset.name,
    });
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
