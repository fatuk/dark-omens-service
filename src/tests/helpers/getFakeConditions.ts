import { faker } from "@faker-js/faker";
import { Condition } from "types/Condition";

export const getFakeConditions = (count: number): Condition[] => {
  return Array.from({ length: count }, () => ({
    id: `condition-${faker.number.int({ min: 1, max: 1000 })}`,
    name: faker.commerce.productName(),
    text: faker.lorem.sentence(),
    type: "condition",
    gameSet: "Test Set",
  }));
};
