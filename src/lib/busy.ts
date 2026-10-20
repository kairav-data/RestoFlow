/** Counts requests that are in flight so the page can show one global loading indicator. */
let pending = 0;
const listeners = new Set<(count: number) => void>();

const emit = () => listeners.forEach((fn) => fn(pending));

export function subscribeBusy(fn: (count: number) => void): () => void {
  listeners.add(fn);
  fn(pending);
  return () => {
    listeners.delete(fn);
  };
}

/** Marks `work` as in progress until it settles. */
export async function trackBusy<T>(work: Promise<T>): Promise<T> {
  pending += 1;
  emit();
  try {
    return await work;
  } finally {
    pending = Math.max(0, pending - 1);
    emit();
  }
}
