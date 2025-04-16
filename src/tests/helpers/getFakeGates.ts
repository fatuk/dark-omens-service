import { faker } from "@faker-js/faker";
import { Gate } from "types/Gate";

export const getFakeGates = (count: number): Gate[] => {
  const location = `location-${faker.number.int({ min: 1, max: 1000 })}`;

  return Array.from({ length: count }, () => ({
    id: `gate-${location}`,
    name: faker.commerce.productName(),
    text: faker.lorem.sentence(),
    type: "gate",
    gameSet: "Test Set",
    location,
    color: faker.helpers.arrayElement(["red", "blue", "green"]),
  }));
};
