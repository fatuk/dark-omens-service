import { Card } from "./Card";

export type CardRepository<T extends Card> = {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  getMap(): Promise<Map<string, T>>;
};
