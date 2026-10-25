let counter = 0;

/** Small unique id generator (no external dependency). */
export function newId(): string {
  counter = (counter + 1) % 1679616;
  return (
    Date.now().toString(36) +
    counter.toString(36) +
    Math.random().toString(36).slice(2, 6)
  );
}
