import { describe, beforeEach, test, expect, vi } from "vitest";
import type { PlayerState } from "types/PlayerState";
import type { PlayerStateService } from "types/PlayerStateService";
import { ILog } from "infrastructure/Log";
import { IPlayer } from "./IPlayer";
import { Player } from "./Player";
import { getFakePlayers } from "tests/helpers/getFakePlayers";

describe("Domain Player (unit)", () => {
  let stateSvc: PlayerStateService;
  let log: ILog;
  let svc: IPlayer;
  let store: PlayerState[];

  beforeEach(() => {
    store = [];

    stateSvc = {
      getAll: () => [...store],
      getById: (id) => store.find((p) => p.id === id),
      update: (p) => {
        const idx = store.findIndex((x) => x.id === p.id);
        if (idx >= 0) store[idx] = { ...p };
        else store.push({ ...p });
      },
      clear: () => {
        store = [];
      },
    };

    log = {
      add: vi.fn(),
      get: vi.fn(() => []),
      clear: vi.fn(),
    };

    svc = new Player(stateSvc, log);
  });

  test("initialize сортирует по turnOrder и сбрасывает actionsTaken", () => {
    const players = getFakePlayers(4).reverse();
    players[0].actionsTaken = ["foo"];
    svc.initialize(players);

    const all = stateSvc.getAll();
    expect(all.map((p) => p.turnOrder)).toEqual([0, 1, 2, 3]);
    all.forEach((p) => expect(p.actionsTaken).toEqual([]));
    expect(log.add).toHaveBeenCalledWith("Игроки инициализированы");
  });

  test("canTakeAction и recordAction работают корректно", () => {
    const [p] = getFakePlayers(1);
    stateSvc.clear();
    stateSvc.update({ ...p, actionsTaken: [] });

    expect(svc.canTakeAction(p.id, "jump")).toBe(true);
    svc.recordAction(p.id, "jump");
    expect(stateSvc.getById(p.id)!.actionsTaken).toContain("jump");
    expect(log.add).toHaveBeenCalledWith(
      `Игрок ${p.id} выполнил действие: jump`
    );

    svc.recordAction(p.id, "jump");
    expect(stateSvc.getById(p.id)!.actionsTaken).toEqual(["jump"]);

    svc.recordAction(p.id, "run");
    expect(svc.canTakeAction(p.id, "swim")).toBe(false);
  });

  test("resetActions очищает actionsTaken у всех игроков", () => {
    const players = getFakePlayers(2);
    svc.initialize(players);

    store[0].actionsTaken = ["a", "b"];
    store[1].actionsTaken = ["x"];
    svc.resetActions();

    stateSvc.getAll().forEach((p) => {
      expect(p.actionsTaken).toEqual([]);
    });
    expect(log.add).toHaveBeenCalledWith("Все действия игроков сброшены");
  });

  test("move корректно перемещает и логирует", () => {
    const [p] = getFakePlayers(1);
    svc.initialize([p]);

    const ok = svc.move(p.id, "newLoc");
    expect(ok).toBe(true);
    const updated = stateSvc.getById(p.id)!;
    expect(updated.locationId).toBe("newLoc");
    expect(updated.actionsTaken).toContain("move");
    expect(log.add).toHaveBeenCalledWith(`Игрок ${p.id} переместился в newLoc`);
  });

  test("healHealth и loseHealth обновляют здоровье и отмечают смерть", () => {
    const [p] = getFakePlayers(1);
    svc.initialize([p]);

    const healed = svc.healHealth(p.id, 3);
    expect(healed).toBe(true);
    expect(stateSvc.getById(p.id)!.health).toBe(
      Math.min(p.health + 3, p.maxHealth)
    );

    const injured = svc.loseHealth(p.id, p.maxHealth + 10);
    expect(injured).toBe(true);
    const after = stateSvc.getById(p.id)!;
    expect(after.health).toBe(0);
    expect(after.isDefeated).toBe(true);
    expect(after.deathReason).toBe("injury");
    expect(log.add).toHaveBeenCalledWith(`Игрок ${p.id} погиб от ран`);
  });

  test("healSanity и loseSanity обновляют рассудок и отмечают безумие", () => {
    const [p] = getFakePlayers(1);
    svc.initialize([p]);

    const sOK = svc.healSanity(p.id, 2);
    expect(sOK).toBe(true);
    expect(stateSvc.getById(p.id)!.sanity).toBe(
      Math.min(p.sanity + 2, p.maxSanity)
    );

    const sLose = svc.loseSanity(p.id, p.maxSanity + 5);
    expect(sLose).toBe(true);
    const after = stateSvc.getById(p.id)!;
    expect(after.sanity).toBe(0);
    expect(after.isDefeated).toBe(true);
    expect(after.deathReason).toBe("sanity");
    expect(log.add).toHaveBeenCalledWith(`Игрок ${p.id} сошел с ума`);
  });

  test("resolveEncounter определяет тип встречи по локации", () => {
    const [p] = getFakePlayers(1);
    svc.initialize([p]);

    const cases: Record<string, string> = {
      cityPark: "city",
      otherPlace: "otherWorld",
      expedition: "expedition",
      mysticRuins: "mysticRuins",
      nowhere: "generic",
    };

    for (const [loc, expectType] of Object.entries(cases)) {
      stateSvc.getById(p.id)!.locationId = loc;
      const t = svc.resolveEncounter(p.id);
      expect(t).toBe(expectType);
      expect(log.add).toHaveBeenCalledWith(
        `Игрок ${p.id} проходит ${expectType} встречу в ${loc}`
      );
    }
  });

  test("restore очищает и восстанавливает игроков", () => {
    const players = getFakePlayers(3);
    svc.initialize(players);

    store[0].health = 1;
    svc.restore(players);

    const all = stateSvc.getAll();
    expect(all.length).toBe(3);
    expect(all.map((p) => p.id)).toEqual(players.map((p) => p.id));
    expect(stateSvc.getById(players[0].id)!.health).toBe(players[0].health);
    expect(log.add).toHaveBeenCalledWith("Состояние игроков восстановлено");
  });
});
