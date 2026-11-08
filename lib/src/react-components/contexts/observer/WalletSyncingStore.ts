/**
 * Internal use only. Holds whether the WalletObserver is syncing outside of
 * React state, so a sync re-renders only the components that read it through
 * `useWalletSyncing`, never the provider or the shared wallet contexts.
 */
export class WalletSyncingStore {
  private syncing = false;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): boolean => this.syncing;

  setSyncing(syncing: boolean): void {
    if (this.syncing === syncing) {
      return;
    }

    this.syncing = syncing;
    this.listeners.forEach((listener) => listener());
  }
}
