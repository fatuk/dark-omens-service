import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GateRepository } from "repositories/GateRepository";
import { ClueRepository } from "repositories/ClueRepository";
import { PlayerRepository } from "repositories/PlayerRepository";

import { Game } from "application/Game";
import { GameFlow, IGameFlowState } from "application/GameFlow";
import { IMarketState, Market } from "domain/Market";
import { Clue, IClueState } from "domain/Clue";
import { IPlayerState, Player } from "domain/Player";
import { Gate, IGateState } from "domain/Gate";
import { AllDecks } from "infrastructure/AllDecks";
import { ILogState, Log } from "infrastructure/Log";

import { GameState } from "types/GameState";
import { Services } from "types/Services";
import { PlayerState } from "types/PlayerState";
import { GamePhase } from "types/GamePhase";
import { LogEntry } from "types/Log";

interface customWindow extends Window {
  game?: any;
}

declare const window: customWindow;

const init = async () => {
  const [assets, spells, conditions, gates, clues, players] = await Promise.all(
    [
      new AssetRepository().getAll(),
      new SpellRepository().getAll(),
      new ConditionRepository().getAll(),
      new GateRepository().getAll(),
      new ClueRepository().getAll(),
      new PlayerRepository().getAll(),
    ]
  );

  const assetDb = new Map(assets.map((c) => [c.id, c]));
  const spellDb = new Map(spells.map((c) => [c.id, c]));
  const conditionDb = new Map(conditions.map((c) => [c.id, c]));
  const gateDb = new Map(gates.map((c) => [c.id, c]));
  const clueDb = new Map(clues.map((c) => [c.id, c]));

  const allDecks = new AllDecks({
    asset: { deck: assets, db: assetDb },
    spell: { deck: spells, db: spellDb },
    condition: {
      deck: conditions,
      db: conditionDb,
    },
    gate: { deck: gates, db: gateDb },
    clue: { deck: clues, db: clueDb },
  });

  const gameState: GameState = {
    market: [],
    turn: {
      round: 1,
      phase: "Action",
      leadInvestigatorId: "",
      currentInvestigatorId: "",
    },
    decks: allDecks.getState(),
    clues: [],
    openGates: [],
    players,
    log: [],
  };

  const logState: ILogState = {
    getState: () => gameState.log,
    setState: (log: LogEntry[]) => {
      gameState.log = log;
    },
    add: (entry: any) => {
      gameState.log.push(entry);
    },
  };

  const marketState: IMarketState = {
    getMarketIds: () => gameState.market,
    setMarketIds: (ids: string[]) => {
      gameState.market = ids;
    },
    getAssetById: (id: string) => assetDb.get(id),
  };

  const clueState: IClueState = {
    getClueIds: () => gameState.clues,
    setClueIds: (ids: string[]) => {
      gameState.clues = ids;
    },
    getClueById: (id: string) => clueDb.get(id),
  };

  const playerState: IPlayerState = {
    getAll: () => gameState.players,
    getById: (id: string) => gameState.players.find((p) => p.id === id),
    update: (playerState: PlayerState): void => {
      const index = gameState.players.findIndex((p) => p.id === playerState.id);

      if (index !== -1) {
        gameState.players[index] = playerState;
      }
    },
    clear: (): void => {
      gameState.players = [];
    },
  };

  const gateState: IGateState = {
    getGateIds: () => gameState.openGates,
    setGateIds: (ids: string[]) => {
      gameState.openGates = ids;
    },
    getGateById: (id: string) => gateDb.get(id),
  };

  const gameFlowState: IGameFlowState = {
    getTurn: () => gameState.turn,
    setPhase: (phase: GamePhase) => {
      gameState.turn.phase = phase;
    },
    setRound: (round: number) => {
      gameState.turn.round = round;
    },
    setLeadInvestigatorId: (id: string) => {
      gameState.turn.leadInvestigatorId = id;
    },
    setCurrentInvestigatorId: (id: string) => {
      gameState.turn.currentInvestigatorId = id;
    },
    getPlayers: () => gameState.players,
  };

  const assetDeck = allDecks.getManager("asset");
  const clueDeck = allDecks.getManager("clue");
  const gateDeck = allDecks.getManager("gate");

  const log = new Log(logState);
  const market = new Market(assetDeck, marketState, log);
  const clue = new Clue(clueDeck, clueState, log);
  const player = new Player(playerState, log);
  const gate = new Gate(gateDeck, gateState, log);
  const gameFlow = new GameFlow(gameFlowState, log);

  const services: Services = {
    log,
    market,
    clue,
    player,
    gate,
    gameFlow,
  };

  const game = new Game(allDecks, players, services);

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
