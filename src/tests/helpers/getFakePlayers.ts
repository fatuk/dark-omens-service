import { faker } from "@faker-js/faker";
import { PlayerState } from "types/PlayerState";

export const getFakePlayers = (count: number): PlayerState[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${faker.number.int({ min: 1, max: 1000 })}`,
    userId: `user-${faker.number.int({ min: 1, max: 1000 })}`,
    investigatorId: `investigator-${faker.number.int({ min: 1, max: 1000 })}`,
    isOnline: faker.datatype.boolean(),
    turnOrder: i,
    health: faker.number.int({ min: 1, max: 10 }),
    maxHealth: faker.number.int({ min: 1, max: 10 }),
    sanity: faker.number.int({ min: 1, max: 10 }),
    maxSanity: faker.number.int({ min: 1, max: 10 }),
    locationId: `location-${faker.number.int({ min: 1, max: 1000 })}`,
    assetIds: [],
    conditionIds: [],
    actionsTaken: [],
    clueCount: faker.number.int({ min: 0, max: 10 }),
    focusCount: faker.number.int({ min: 0, max: 2 }),
    resourceCount: faker.number.int({ min: 0, max: 2 }),
    isDefeated: false,
    isEliminated: false,
    deathReason: null,
    skillSet: {
      lore: faker.number.int({ min: 0, max: 5 }),
      influence: faker.number.int({ min: 0, max: 5 }),
      observation: faker.number.int({ min: 0, max: 5 }),
      strength: faker.number.int({ min: 0, max: 5 }),
      will: faker.number.int({ min: 0, max: 5 }),
    },
    skillModifiers: {
      lore: 0,
      influence: 0,
      observation: 0,
      strength: 0,
      will: 0,
    },
  }));
};
