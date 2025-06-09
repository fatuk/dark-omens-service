import { Asset } from "types/Asset";
import { Condition } from "types/Condition";
import { CardMap, CardType } from "types/Card";
import { GameAction } from "types/GameAction";
import { PlayerState } from "types/PlayerState";
import { GameState } from "types/GameState";
import { Gate } from "types/Gate";
import { Clue } from "types/Clue";
import { Services } from "types/Services";
import { resolveCards } from "helpers/resolveCards";
import { IAllDecks } from "infrastructure/AllDecks";
import { LogEntry } from "types/Log";

export class Game {
  private decks: IAllDecks;
  private openGates: string[] = [];
  private services: Services;

  constructor(decks: IAllDecks, players: PlayerState[], services: Services) {
    this.services = services;
    this.decks = decks;
    const sortedPlayers = this.services.player
      .getState()
      .sort((a, b) => a.turnOrder - b.turnOrder);

    this.services.player.resetActions();
    this.services.player.initialize(players);
    this.services.gameFlow.passLeadInvestigator(sortedPlayers[0]?.id ?? "");
    this.services.gameFlow.nextInvestigator();
    this.services.market.replenish();
  }

  drawClue(): string | null {
    return this.services.clue.draw();
  }

  discardClue(clueId: string): boolean {
    return this.services.clue.discard(clueId);
  }

  getCluesState(): Clue[] {
    return this.services.clue.getState();
  }

  drawGate(): string | null {
    return this.services.gate.draw();
  }

  closeGate(gateId: string): boolean {
    return this.services.gate.discard(gateId);
  }

  getOpenedGates(): Gate[] {
    return this.services.gate.getState();
  }

  drawCard<T extends CardType>(type: T): CardMap[T] | null {
    const card = this.decks.draw(type);
    if (card) this.services.log.add(`Вытянута карта: ${card.name}`);
    return card;
  }

  discardCard<T extends CardType>(type: T, card: CardMap[T]): void {
    this.decks.discard(type, card);
    this.services.log.add(`Сброшена карта: ${card.name}`);
  }

  shuffleDeck<T extends CardType>(type: T): void {
    this.decks.shuffle(type);
    this.services.log.add(`Перемешана колода: ${type}`);
  }

  getState(): GameState {
    return {
      turn: { ...this.services.gameFlow.getTurn() },
      market: this.services.market.getState().map((c) => c.id),
      log: this.services.log.getState(),
      players: this.services.player.getState(),
      openGates: [...this.openGates],
      decks: this.decks.getState(),
      clues: this.services.clue.getState().map((c) => c.id),
    };
  }

  getMarketState(): Asset[] {
    return this.services.market.getState();
  }

  replenishMarket(): void {
    this.services.market.replenish();
  }

  buyFromMarket(cardId: string): Asset | null {
    return this.services.market.buy(cardId);
  }

  getPlayerState(
    playerId: string
  ): (PlayerState & { assets: Asset[]; conditions: Condition[] }) | null {
    const player = this.services.player.getById(playerId);
    if (!player) return null;

    const assets = resolveCards(player.assetIds, (id) =>
      this.decks.getCardById("asset", id)
    );

    const conditions = resolveCards(player.conditionIds, (id) =>
      this.decks.getCardById("condition", id)
    );

    if (!assets || !conditions) return null;

    return { ...player, assets, conditions };
  }

  canTakeAction(playerId: string, action: string): boolean {
    return this.services.player.canTakeAction(playerId, action);
  }

  recordAction(playerId: string, action: string): void {
    this.services.player.recordAction(playerId, action);
  }

  resetActions(): void {
    this.services.player.resetActions();
  }

  resolveEncounter(playerId: string): string {
    return this.services.player.resolveEncounter(playerId);
  }

  movePlayer(playerId: string, location: string): boolean {
    return this.services.player.move(playerId, location);
  }

  healHealth(playerId: string, amount: number): boolean {
    return this.services.player.healHealth(playerId, amount);
  }

  loseHealth(playerId: string, amount: number): boolean {
    return this.services.player.loseHealth(playerId, amount);
  }

  healSanity(playerId: string, amount: number): boolean {
    return this.services.player.healSanity(playerId, amount);
  }

  loseSanity(playerId: string, amount: number): boolean {
    return this.services.player.loseSanity(playerId, amount);
  }

  getEncounterType(locationId: string): string {
    if (locationId.startsWith("city")) return "city";
    if (locationId.startsWith("other")) return "otherWorld";
    if (locationId === "expedition") return "expedition";
    if (locationId === "mysticRuins") return "mysticRuins";
    return "generic";
  }

  nextPhase() {
    this.services.gameFlow.nextPhase();
  }

  nextInvestigator() {
    this.services.gameFlow.nextInvestigator();
  }

  passLeadInvestigator(playerId: string) {
    this.services.gameFlow.passLeadInvestigator(playerId);
  }

  restoreFromState(
    state: GameState,
    dbs: {
      [K in keyof CardMap]: Map<string, CardMap[K]>;
    }
  ) {
    this.decks.restoreFromState(state.decks, dbs);
    this.services.gameFlow.setTurn(state.turn);
    this.services.gate.setState(state.openGates);
    this.services.market.setState(state.market);
    this.services.clue.setState(state.clues);
    this.services.player.setState(state.players);
    this.services.log.setState(state.log);
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

  getLog(): LogEntry[] {
    return this.services.log.getState();
  }
}
