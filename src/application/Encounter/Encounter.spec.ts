// tests/Encounter.test.ts
import { describe, beforeEach, test, expect, vi } from "vitest";
import type { IDeck } from "infrastructure/Deck";
import type { ILog } from "infrastructure/Log";
import type {
  Effect,
  Encounter as EncounterCard,
  EncounterEffect,
} from "types/Encounter";
import { testLog } from "tests/testLog";
import { IEncounterState } from "./IEncounterState";
import { EncounterState } from "./IEncounter";
import { Encounter } from "./Encounter";

describe("Domain Encounter (unit)", () => {
  let deck: IDeck<EncounterCard>;
  let state: IEncounterState;
  let logger: ILog;
  let svc: Encounter;
  let memory: EncounterState | null;

  let simpleEffect: Effect;
  let simpleWrapper: EncounterEffect;
  let oneOfWrapper: EncounterEffect;
  let dummyCard: EncounterCard;

  beforeEach(() => {
    vi.clearAllMocks();
    memory = null;

    simpleEffect = { type: "loseHealth", amount: 1 };
    simpleWrapper = { type: "anyOf", effects: [simpleEffect] };
    oneOfWrapper = {
      type: "oneOf",
      effects: [simpleEffect, { type: "takeRandomAsset" }],
    };

    dummyCard = {
      id: "enc1",
      locationType: "city",
      name: "Test Encounter",
      successEffects: simpleWrapper,
      failureEffects: oneOfWrapper,
    } as unknown as EncounterCard;

    deck = {
      drawByField: vi.fn().mockReturnValue(dummyCard),
    } as unknown as IDeck<EncounterCard>;

    state = {
      getState: vi.fn(() => memory),
      setState: vi.fn((s: EncounterState) => {
        memory = s;
      }),
      clearState: vi.fn(() => {
        memory = null;
      }),
      getEncounterById: vi.fn((id) => (id === dummyCard.id ? dummyCard : null)),
    } as unknown as IEncounterState;

    logger = testLog;
    svc = new Encounter(deck, state, logger);
  });

  test("start draws card, sets state and logs, returns card.id", () => {
    const result = svc.start("player1", "city");
    expect(deck.drawByField).toHaveBeenCalledWith("locationType", "city");
    expect(state.setState).toHaveBeenCalledWith({
      playerId: "player1",
      encounterId: "enc1",
    });
    expect(logger.add).toHaveBeenCalledWith("encounter.start", {
      playerId: "player1",
      encounterId: "enc1",
    });
    expect(result?.id).toBe("enc1");
  });

  test("start returns null if deck is empty", () => {
    vi.mocked(deck.drawByField).mockReturnValueOnce(null);
    expect(svc.start("player1", "city")).toBeNull();
  });

  test("start returns null if there is already a pending encounter", () => {
    memory = { playerId: "player1", encounterId: "enc1" };
    expect(svc.start("player1", "city")).toBeNull();
  });

  test("getState returns pending state", () => {
    memory = { playerId: "player1", encounterId: "enc1" };
    expect(svc.getState()).toEqual({
      playerId: "player1",
      encounterId: "enc1",
    });
  });

  test("getState returns null if no pending state", () => {
    expect(svc.getState()).toBeNull();
  });

  test("getEncounter returns the card and logs", () => {
    memory = { playerId: "player1", encounterId: "enc1" };
    const card = svc.getEncounter();
    expect(card).toBe(dummyCard);
    expect(logger.add).toHaveBeenCalledWith("encounter.getEncounter", {
      playerId: "player1",
      encounterId: "enc1",
    });
  });

  test("getEncounter returns null if no pending state", () => {
    expect(svc.getEncounter()).toBeNull();
  });

  test("getEncounter returns null if card not found", () => {
    memory = { playerId: "player1", encounterId: "unknown" };
    expect(svc.getEncounter()).toBeNull();
  });

  test("resolve(true) returns success wrapper and logs", () => {
    memory = { playerId: "player1", encounterId: "enc1" };
    const wrapper = svc.resolve(true);
    expect(logger.add).toHaveBeenCalledWith("encounter.resolve", {
      playerId: "player1",
      encounterId: "enc1",
      success: true,
    });
    expect(wrapper).toBe(simpleWrapper);
  });

  test("resolve(false) returns failure wrapper", () => {
    memory = { playerId: "player1", encounterId: "enc1" };
    const wrapper = svc.resolve(false);
    expect(wrapper).toBe(oneOfWrapper);
  });

  test("resolve returns null if no pending encounter", () => {
    expect(svc.resolve(true)).toBeNull();
  });

  test("resolve returns null if encounter not found", () => {
    memory = { playerId: "player1", encounterId: "unknown" };
    expect(svc.resolve(true)).toBeNull();
  });
});
