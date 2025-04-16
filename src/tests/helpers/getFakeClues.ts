import { faker } from "@faker-js/faker";
import { Clue } from "types/Clue";

export const getFakeClues = (count: number): Clue[] => {
  return Array.from({ length: count }, () => ({
    id: `clue-${faker.number.int({ min: 1, max: 1000 })}`,
    name: faker.commerce.productName(),
    text: faker.lorem.sentence(),
    type: "clue",
    gameSet: "Test Set",
    location: `location-${faker.number.int({ min: 1, max: 1000 })}`,
  }));
};
