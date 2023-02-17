const nextIds: Record<string, number> = {};

export default function useIncrementingId(prefix: string) {
  return () => {
    const nextId = nextIds[prefix];
    if (!nextId) {
      nextIds[prefix] = 1;
      return `${prefix}0`;
    } else {
      nextIds[prefix] = nextId + 1;
      return `${prefix}${nextId}`;
    }
  }
}