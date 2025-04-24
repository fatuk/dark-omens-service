import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GameService } from "services/GameService";

import players from "data/players.json";
import { GateRepository } from "repositories/GateRepository";
import { ClueRepository } from "repositories/ClueRepository";
import { LogService } from "services/LogService";
import { MarketService, MarketState } from "services/MarketService";

const gameState = {
  market: [] as string[],
};

const init = async () => {
  const [assets, spells, conditions, gates, clues] = await Promise.all([
    new AssetRepository().getAll(),
    new SpellRepository().getAll(),
    new ConditionRepository().getAll(),
    new GateRepository().getAll(),
    new ClueRepository().getAll(),
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

  const logService = new LogService();
  const marketState: MarketState = {
    getMarketIds: () => gameState.market,
    setMarketIds: (ids) => {
      gameState.market = ids;
    },
    getAssetById: (id) => assetDb.get(id),
  };
  const assetDeck = allDecks.getManager("asset");
  const marketService = new MarketService(assetDeck, marketState, logService);

  const services = {
    logService,
    marketService,
  };

  const game = new GameService(allDecks, players, services);

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
