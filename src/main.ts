import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GameService } from "services/GameService";

import players from "data/players.json";
import { GateRepository } from "repositories/GateRepository";
import { ClueRepository } from "repositories/ClueRepository";

const init = async () => {
  const assetRepo = new AssetRepository();
  const spellRepo = new SpellRepository();
  const conditionRepo = new ConditionRepository();
  const gateRepo = new GateRepository();
  const clueRepo = new ClueRepository();

  const [assets, spells, conditions, gates, clues] = await Promise.all([
    assetRepo.getAll(),
    spellRepo.getAll(),
    conditionRepo.getAll(),
    gateRepo.getAll(),
    clueRepo.getAll(),
  ]);

  const assetDb = new Map(assets.map((c) => [c.id, c]));
  const spellDb = new Map(spells.map((c) => [c.id, c]));
  const conditionDb = new Map(conditions.map((c) => [c.id, c]));
  const gateDb = new Map(gates.map((c) => [c.id, c]));
  const clueDb = new Map(clues.map((c) => [c.id, c]));

  const allDecks = new AllDecksManager({
    asset: { deck: assets, db: assetDb },
    spell: { deck: spells, db: spellDb },
    condition: {
      deck: conditions,
      db: conditionDb,
    },
    gate: { deck: gates, db: gateDb },
    clue: { deck: clues, db: clueDb },
  });

  const game = new GameService(allDecks, players);

  // game.restoreFromState(
  //   {},
  //   {
  //     asset: assetDb,
  //     spell: spellDb,
  //     condition: conditionDb,
  //     gate: gateDb,
  //   }
  // );
  window.game = game;
};
init();
