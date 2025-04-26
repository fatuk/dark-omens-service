export interface ILog {
  add(message: string): void;
  get(): string[];
  clear(): void;
}
