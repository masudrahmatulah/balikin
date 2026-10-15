export interface ScanStream {
  getTracks(): Array<{ stop(): void }>;
}

type ScanSessionOptions<T extends ScanStream> = {
  openStream: () => Promise<T>;
  playStream: (stream: T) => Promise<void>;
  scanFrame: () => Promise<boolean>;
  onActive: () => void;
  onStop: () => void;
  schedule: (callback: () => void) => number;
  cancel: (frame: number) => void;
};

/** Owns at most one camera stream and one pending animation frame. */
export class QrScanSession<T extends ScanStream> {
  private generation = 0;
  private starting = false;
  private stream: T | null = null;
  private frame: number | null = null;

  get isBusy() {
    return this.starting || this.stream !== null;
  }

  async start(options: ScanSessionOptions<T>): Promise<void> {
    if (this.isBusy) return;
    this.starting = true;
    const generation = ++this.generation;
    let stream: T | null = null;
    try {
      stream = await options.openStream();
      if (generation !== this.generation) {
        this.stopStream(stream);
        return;
      }
      this.stream = stream;
      await options.playStream(stream);
      if (generation !== this.generation) return;
      this.starting = false;
      options.onActive();

      const tick = async () => {
        this.frame = null;
        if (generation !== this.generation || !this.stream) return;
        try {
          const accepted = await options.scanFrame();
          if (generation !== this.generation || !this.stream) return;
          if (accepted) {
            this.stop(options);
            return;
          }
        } catch { /* Keep scanning when a frame cannot be decoded. */ }
        if (generation === this.generation && this.stream) {
          this.frame = options.schedule(() => { void tick(); });
        }
      };
      this.frame = options.schedule(() => { void tick(); });
    } catch (error) {
      if (generation !== this.generation) {
        if (stream && stream !== this.stream) this.stopStream(stream);
        return;
      }
      this.stop(options);
      throw error;
    } finally {
      if (generation === this.generation) this.starting = false;
    }
  }

  stop(options: Pick<ScanSessionOptions<T>, 'cancel' | 'onStop'>) {
    this.generation++;
    this.starting = false;
    if (this.frame !== null) options.cancel(this.frame);
    this.frame = null;
    if (this.stream) this.stopStream(this.stream);
    this.stream = null;
    options.onStop();
  }

  private stopStream(stream: T) {
    stream.getTracks().forEach(track => track.stop());
  }
}
