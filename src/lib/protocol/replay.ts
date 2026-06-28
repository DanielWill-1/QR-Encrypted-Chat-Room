const WINDOW_SIZE = 1024;

export class ReplayWindow {
  private seen: Set<number> = new Set();
  private windowStart = 0;

  check(seq: number): boolean {
    if (this.seen.has(seq)) return false;
    if (seq < this.windowStart) return false;
    if (seq > this.windowStart + WINDOW_SIZE) {
      this.windowStart = seq - WINDOW_SIZE;
      this.seen.clear();
    }
    this.seen.add(seq);
    this.prune();
    return true;
  }

  private prune() {
    for (const s of this.seen) {
      if (s < this.windowStart) this.seen.delete(s);
    }
  }

  reset() {
    this.seen.clear();
    this.windowStart = 0;
  }
}
