import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GameService } from "services/GameService";

import players from "data/players.json";
import { PlayerState } from "types/PlayerState";

const savedState = {
  asset: {
    drawPile: ["asset_001", "asset_002", "asset_003", "asset_004", "asset_005"],
    discardPile: [],
    removedFromGame: [],
  },
  spell: {
    drawPile: ["spell_astral_travel"],
    discardPile: [],
    removedFromGame: [],
  },
  condition: {
    drawPile: ["condition_blessed"],
    discardPile: [],
    removedFromGame: [],
  },
};

const init = async () => {
  const assetRepo = new AssetRepository();
  const spellRepo = new SpellRepository();
  const conditionRepo = new ConditionRepository();

  const [assets, spells, conditions] = await Promise.all([
    assetRepo.getAll(),
    spellRepo.getAll(),
    conditionRepo.getAll(),
  ]);

  const assetDb = new Map(assets.map((c) => [c.id, c]));
  const spellDb = new Map(spells.map((c) => [c.id, c]));
  const conditionDb = new Map(conditions.map((c) => [c.id, c]));

  const allDecks = new AllDecksManager({
    asset: { deck: assets, db: assetDb },
    spell: { deck: spells, db: spellDb },
    condition: {
      deck: conditions,
      db: conditionDb,
    },
  });

  const game = new GameService(allDecks, players);
  game.restoreFromState(
    {
      turn: {
        round: 1,
        phase: "Action",
        leadInvestigatorId: "player_001",
        currentInvestigatorId: "player_001",
      },
      decks: {
        asset: {
          drawPile: ["asset_004", "asset_003"],
          discardPile: [],
          removedFromGame: [],
        },
        spell: {
          drawPile: [
            "spell_mists_of_releh",
            "spell_clairvoyance",
            "spell_poison_mist",
            "spell_blessing_of_isis",
            "spell_dread_curse_of_azathoth",
            "spell_bind_monster",
            "spell_astral_travel",
            "spell_arcane_insight",
            "spell_flesh_ward",
            "spell_alter_fate",
          ],
          discardPile: [],
          removedFromGame: [],
        },
        condition: {
          drawPile: [
            "condition_hypothermia",
            "condition_madness_paranoia",
            "condition_cursed",
            "condition_blessed",
            "condition_madness_hallucinations",
            "condition_poisoned",
            "condition_dark_pact",
            "condition_injury_leg",
            "condition_injury_head",
            "condition_debt",
          ],
          discardPile: [],
          removedFromGame: [],
        },
      },
      market: ["asset_001", "asset_002", "asset_005", "asset_006"],
      log: [],
      players: [
        {
          id: "player_001",
          userId: "user_001",
          actionsTaken: [],
          investigatorId: "investigator_001",
          turnOrder: 1,
          isOnline: true,
          health: 6,
          sanity: 6,
          locationId: "location_001",
          assetIds: ["asset_001", "asset_002"],
          conditionIds: ["condition_001"],
          clueCount: 1,
          focusCount: 1,
          resourceCount: 1,
        },
        {
          id: "player_002",
          userId: "user_002",
          actionsTaken: [],
          investigatorId: "investigator_002",
          turnOrder: 2,
          isOnline: false,
          health: 5,
          sanity: 7,
          locationId: "location_002",
          assetIds: ["asset_003"],
          conditionIds: [],
          clueCount: 0,
          focusCount: 0,
          resourceCount: 2,
        },
        {
          id: "player_003",
          userId: "user_003",
          actionsTaken: [],
          investigatorId: "investigator_003",
          turnOrder: 3,
          isOnline: true,
          health: 4,
          sanity: 8,
          locationId: "location_003",
          assetIds: ["asset_004", "asset_005"],
          conditionIds: ["condition_002"],
          clueCount: 2,
          focusCount: 1,
          resourceCount: 0,
        },
        {
          id: "player_004",
          userId: "user_004",
          actionsTaken: [],
          investigatorId: "investigator_004",
          turnOrder: 4,
          isOnline: false,
          health: 3,
          sanity: 5,
          locationId: "location_004",
          assetIds: ["asset_006"],
          conditionIds: ["condition_003"],
          clueCount: 0,
          focusCount: 2,
          resourceCount: 3,
        },
      ],
    },
    {
      asset: assetDb,
      spell: spellDb,
      condition: conditionDb,
    }
  );
  window.game = game;
};
init();
