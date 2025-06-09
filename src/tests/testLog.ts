import { vi } from "vitest";

export const testLog = {
  add: vi.fn(),
  getState: vi.fn(() => []),
  setState: vi.fn(() => {}),
};
