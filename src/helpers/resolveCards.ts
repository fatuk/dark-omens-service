export const resolveCards = <T>(
  ids: string[],
  resolver: (id: string) => T | undefined
): T[] => {
  return ids.map(resolver).filter((c): c is T => Boolean(c));
};
