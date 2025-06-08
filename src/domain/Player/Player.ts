import { PlayerState } from "types/PlayerState";
import { PlayerStateService } from "types/PlayerStateService";
import { IPlayer } from "./IPlayer";
import { ILog } from "infrastructure/Log";

const DEFAULT_MAX_ACTIONS = 2;

export class Player implements IPlayer {
  constructor(
    private readonly stateSvc: PlayerStateService,
    private readonly logger: ILog,
    private readonly maxActions = DEFAULT_MAX_ACTIONS
  ) {}

  initialize(initialPlayers: PlayerState[]): void {
    const sorted = initialPlayers
      .slice()
      .sort((a, b) => a.turnOrder - b.turnOrder)
      .map((p) => ({ ...p, actionsTaken: [] }));

    sorted.forEach((p) => this.stateSvc.update(p));
    this.logger.add("player.all.initialize");
  }

  canTakeAction(playerId: string, actionType: string): boolean {
    const player = this.stateSvc.getById(playerId);
    if (!player) return false;
    return (
      player.actionsTaken.length < this.maxActions &&
      !player.actionsTaken.includes(actionType)
    );
  }

  recordAction(playerId: string, actionType: string): void {
    const player = this.stateSvc.getById(playerId);
    if (!player) return;
    if (!player.actionsTaken.includes(actionType)) {
      player.actionsTaken.push(actionType);
      this.stateSvc.update(player);
      this.logger.add("player.action.record", {
        playerId,
        actionType,
      });
    }
  }

  resetActions(): void {
    this.stateSvc.getAll().forEach((p) => {
      p.actionsTaken = [];
      this.stateSvc.update(p);
    });
    this.logger.add("player.all.resetActions");
  }

  move(playerId: string, locationId: string): boolean {
    const player = this.stateSvc.getById(playerId);
    const prevLocation = player?.locationId;

    if (!this.canTakeAction(playerId, "move") || !player) return false;

    player.locationId = locationId;
    this.recordAction(playerId, "move");
    this.logger.add("player.move", {
      playerId,
      from: prevLocation,
      to: locationId,
    });
    this.stateSvc.update(player);

    return true;
  }

  healHealth(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);

    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.health;
    player.health = Math.min(player.health + amount, player.maxHealth);
    this.logger.add("player.healHealth", {
      playerId,
      oldHealth: old,
      newHealth: player.health,
    });
    this.stateSvc.update(player);

    return true;
  }

  loseHealth(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);

    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.health;
    player.health = Math.max(player.health - amount, 0);
    this.logger.add("player.loseHealth", {
      playerId,
      oldHealth: old,
      newHealth: player.health,
    });

    if (player.health === 0) {
      player.isDefeated = true;
      player.deathReason = "injury";
      this.logger.add("player.loseHealth.death", {
        playerId,
        reason: "injury",
      });
    }
    this.stateSvc.update(player);
    return true;
  }

  healSanity(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);

    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.sanity;
    player.sanity = Math.min(player.sanity + amount, player.maxSanity);
    this.logger.add("player.healSanity", {
      playerId,
      oldSanity: old,
      newSanity: player.sanity,
    });
    this.stateSvc.update(player);

    return true;
  }

  loseSanity(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);

    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.sanity;
    player.sanity = Math.max(player.sanity - amount, 0);
    this.logger.add("player.loseSanity", {
      playerId,
      oldSanity: old,
      newSanity: player.sanity,
    });

    if (player.sanity === 0) {
      player.isDefeated = true;
      player.deathReason = "sanity";
      this.logger.add("player.loseSanity.death", {
        playerId,
        reason: "sanity",
      });
    }
    this.stateSvc.update(player);

    return true;
  }

  resolveEncounter(playerId: string): string {
    const player = this.stateSvc.getById(playerId);

    if (!player) return "Игрок не найден";

    const loc = player.locationId;
    let type = "generic";

    if (loc.startsWith("city")) type = "city";
    else if (loc.startsWith("other")) type = "otherWorld";
    else if (loc === "expedition") type = "expedition";
    else if (loc === "mysticRuins") type = "mysticRuins";

    this.logger.add("player.resolveEncounter", {
      playerId,
      location: loc,
      encounterType: type,
    });

    return type;
  }

  restore(players: PlayerState[]): void {
    players.forEach((p) => this.stateSvc.update({ ...p }));
    this.logger.add("player.all.restore");
  }

  getAll(): PlayerState[] {
    return this.stateSvc.getAll();
  }

  getById(id: string): PlayerState | undefined {
    return this.stateSvc.getById(id);
  }
}
