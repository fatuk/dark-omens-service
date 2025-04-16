import { faker } from "@faker-js/faker";
import { Spell } from "types/Spell";

export const getFakeSpells = (count: number): Spell[] => {
  return Array.from({ length: count }, () => ({
    id: `spell-${faker.number.int({ min: 1, max: 1000 })}`,
    name: faker.commerce.productName(),
    text: faker.lorem.sentence(),
    type: "spell",
    gameSet: "Test Set",
  }));
};
