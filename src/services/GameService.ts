import { AllDecksManager } from "./AllDeckManager";
import { Asset } from "types/Asset";
import { Condition } from "types/Condition";
import { CardMap, CardType } from "types/Card";
import { GameAction } from "types/GameAction";
import { PlayerState } from "types/PlayerState";
import { GameState } from "types/GameState";
import { Gate } from "types/Gate";
import { Clue } from "types/Clue";
import { Services } from "types/Services";

const MAX_ACTIONS_PER_PLAYER = 2;

export class GameService {
  private decks: AllDecksManager;
  private log: string[] = [];
  private turn: GameState["turn"] = {
    round: 1,
    phase: "Action",
    leadInvestigatorId: "",
    currentInvestigatorId: "",
  };
  private players: PlayerState[] = [];
  private openGates: string[] = [];
  private clues: string[] = [];
  private services: Services;

  constructor(
    decks: AllDecksManager,
    players: PlayerState[],
    services: Services
  ) {
    this.decks = decks;
    this.players = players
      .sort((a, b) => a.turnOrder - b.turnOrder)
      .map((p) => ({ ...p, actionsTaken: [] }));
    this.turn.leadInvestigatorId = this.players[0]?.id ?? "";
    this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
    this.services = services;
    this.services.marketService.replenish();
  }

  drawClue(): string | null {
    const clue = this.decks.draw("clue");
    if (!clue) return null;
    this.clues.push(clue.id);
    this.log.push(`Выложена улика: ${clue.name}`);
    return clue.id;
  }

  discardClue(clueId: string): boolean {
    const index = this.clues.findIndex((clue) => clue === clueId);
    if (index === -1) return false;
    this.clues.splice(index, 1);
    this.log.push(`Улика ${clueId} сброшена`);
    return true;
  }

  getCluesState(): Clue[] {
    return this.clues
      .map((clueId) => this.decks.getCardById("clue", clueId))
      .filter(Boolean) as Clue[];
  }

  drawGate(): Gate | null {
    const gate = this.decks.draw("gate") as Gate | null;
    if (!gate) return null;
    this.openGates.push(gate.location);
    this.log.push(`Открылись врата в ${gate.location} (${gate.color})`);
    return gate;
  }

  closeGate(locationName: string): boolean {
    const index = this.openGates.findIndex((gate) => gate === locationName);
    if (index === -1) return false;
    this.openGates.splice(index, 1);
    this.log.push(`Врата в ${locationName} были закрыты`);
    return true;
  }

  getOpenedGatesState(): Gate[] {
    return this.openGates
      .map((location) => this.decks.getCardById("gate", `gate-${location}`))
      .filter(Boolean) as Gate[];
  }

  getPlayerState(
    playerId: string
  ): (PlayerState & { assets: Asset[]; conditions: Condition[] }) | null {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return null;
    const assets = player.assetIds
      .map((id) => this.decks.getCardById("asset", id))
      .filter(Boolean) as Asset[];
    const conditions = player.conditionIds
      .map((id) => this.decks.getCardById("condition", id))
      .filter(Boolean) as Condition[];
    return { ...player, assets, conditions };
  }

  drawCard<T extends CardType>(type: T): CardMap[T] | null {
    const card = this.decks.draw(type);
    if (card) this.log.push(`Вытянута карта: ${card.name}`);
    return card;
  }

  discardCard<T extends CardType>(type: T, card: CardMap[T]): void {
    this.decks.discard(type, card);
    this.log.push(`Сброшена карта: ${card.name}`);
  }

  shuffleDeck<T extends CardType>(type: T): void {
    this.decks.shuffle(type);
    this.log.push(`Перемешана колода: ${type}`);
  }

  getState(): GameState {
    return {
      turn: { ...this.turn },
      market: this.services.marketService.getAll().map((c) => c.id),
      log: this.services.logService.get(),
      players: this.players,
      openGates: [...this.openGates],
      decks: this.decks.getState(),
      clues: [...this.clues],
    };
  }

  getMarketState(): Asset[] {
    return this.services.marketService.getAll();
  }

  replenishMarket(): void {
    this.services.marketService.replenish();
  }

  buyFromMarket(cardId: string): Asset | null {
    return this.services.marketService.buy(cardId);
  }

  canTakeAction(playerId: string, actionType: string): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return false;
    return (
      player.actionsTaken.length < MAX_ACTIONS_PER_PLAYER &&
      !player.actionsTaken.includes(actionType)
    );
  }

  recordAction(playerId: string, actionType: string): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;
    if (!player.actionsTaken.includes(actionType)) {
      player.actionsTaken.push(actionType);
      this.log.push(`Игрок ${playerId} выполнил действие: ${actionType}`);
    }
  }

  resetActions(): void {
    this.players.forEach((p) => (p.actionsTaken = []));
    this.log.push("Все действия сброшены");
  }

  resolveEncounter(playerId: string): string {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return "Игрок не найден";

    const locationId = player.locationId;
    const type = this.getEncounterType(locationId);

    this.log.push(
      `Игрок ${playerId} проходит ${type} встречу в локации ${locationId}`
    );
    return type;
  }

  getEncounterType(locationId: string): string {
    if (locationId.startsWith("city")) return "city";
    if (locationId.startsWith("other")) return "otherWorld";
    if (locationId === "expedition") return "expedition";
    if (locationId === "mysticRuins") return "mysticRuins";
    return "generic";
  }

  nextPhase() {
    switch (this.turn.phase) {
      case "Action":
        this.turn.phase = "Encounter";
        this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
        this.resetActions();
        this.log.push("Фаза: встречи");
        break;
      case "Encounter":
        this.turn.phase = "Mythos";
        this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
        this.log.push("Фаза: мифов");
        break;
      case "Mythos":
        this.turn.phase = "Action";
        this.turn.round++;
        this.passLeadInvestigator();
        this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
        this.resetActions();
        this.log.push(`Раунд ${this.turn.round}`);
        break;
    }
  }

  nextInvestigator() {
    const index = this.players.findIndex(
      (p) => p.id === this.turn.currentInvestigatorId
    );
    if (index === -1) return;
    const next = this.players[(index + 1) % this.players.length];
    this.turn.currentInvestigatorId = next.id;
    this.log.push(`Ход переходит к игроку: ${next.id}`);
  }

  passLeadInvestigator() {
    const index = this.players.findIndex(
      (p) => p.id === this.turn.leadInvestigatorId
    );
    const next = this.players[(index + 1) % this.players.length];
    this.turn.leadInvestigatorId = next.id;
    this.log.push(`Новый лидер: ${next.id}`);
  }

  movePlayer(playerId: string, locationId: string): boolean {
    if (!this.canTakeAction(playerId, "move")) return false;

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.locationId = locationId;
    this.recordAction(playerId, "move");
    this.log.push(`Игрок ${playerId} переместился в локацию ${locationId}`);
    return true;
  }

  healHealth(playerId: string, amount: number): boolean {
    const player = this.players.find((p) => p.id === playerId);

    if (!player || amount <= 0 || player.isDefeated) return false;

    const before = player.health;
    player.health = Math.min(player.health + amount, player.maxHealth);

    this.log.push(
      `Игрок ${playerId} восстановил здоровье: ${before} → ${player.health}`
    );
    return true;
  }

  loseHealth(playerId: string, amount: number): boolean {
    const player = this.players.find((p) => p.id === playerId);

    if (!player || amount <= 0 || player.isDefeated) return false;

    const before = player.health;
    player.health = Math.max(player.health - amount, 0);
    this.log.push(
      `Игрок ${playerId} потерял здоровье: ${before} → ${player.health}`
    );
    if (player.health === 0) {
      player.isDefeated = true;
      this.log.push(`Игрок ${playerId} пал от ран.`);
    }
    return true;
  }

  healSanity(playerId: string, amount: number): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || amount <= 0 || player.isDefeated) return false;
    const before = player.sanity;
    player.sanity = Math.min(player.sanity + amount, player.maxSanity);
    this.log.push(
      `Игрок ${playerId} восстановил рассудок: ${before} → ${player.sanity}`
    );
    return true;
  }

  loseSanity(playerId: string, amount: number): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || amount <= 0 || player.isDefeated) return false;
    const before = player.sanity;
    player.sanity = Math.max(player.sanity - amount, 0);
    this.log.push(
      `Игрок ${playerId} потерял рассудок: ${before} → ${player.sanity}`
    );
    if (player.sanity === 0) {
      player.isDefeated = true;
      this.log.push(`Игрок ${playerId} пал от ужаса.`);
    }
    return true;
  }

  restoreFromState(
    state: GameState,
    dbs: {
      [K in keyof CardMap]: Map<string, CardMap[K]>;
    }
  ) {
    this.turn = state.turn;
    this.decks.restoreFromState(state.decks, dbs);
    this.market = state.market.map((id) => dbs.asset.get(id)!);
    this.log = state.log;
    this.players = state.players;
    this.openGates = state.openGates;
    this.clues = state.clues;
  }

  apply(action: GameAction) {
    switch (action.type) {
      case "DRAW_CARD":
        return this.drawCard(action.cardType);
      case "DISCARD_CARD":
        return this.discardCard(action.cardType, action.card);
      case "SHUFFLE_DECK":
        return this.shuffleDeck(action.cardType);
    }
  }

  getLog(): string[] {
    return this.services.logService.get();
  }
}
