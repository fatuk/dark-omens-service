import { faker } from "@faker-js/faker";
import { Asset } from "types/Asset";

export const getFakeAssets = (count: number): Asset[] => {
  return Array.from({ length: count }, () => ({
    id: `asset-${faker.number.int({ min: 1, max: 1000 })}`,
    name: faker.commerce.productName(),
    text: faker.lorem.sentence(),
    type: "asset",
    gameSet: "Test Set",
    cost: faker.number.int({ min: 1, max: 5 }),
    hasEffect: faker.datatype.boolean(),
    hasAction: faker.datatype.boolean(),
    hasSkillBonus: faker.datatype.boolean(),
    hasReroll: faker.datatype.boolean(),
    hasAdditionalDice: faker.datatype.boolean(),
    hasResultManipulation: faker.datatype.boolean(),
    hasDiscardEffect: faker.datatype.boolean(),
    hasReckoning: faker.datatype.boolean(),
    effects: [],
    tags: ["item"],
  }));
};
