import { useContext, useSyncExternalStore } from "react";

import { WalletSyncingContext } from "../contexts/observer/context.js";

/**
 * Whether the WalletObserver is syncing with the wallet right now. Only the
 * components that call this hook re-render when a sync starts or ends.
 *
 * @returns {boolean}
 */
export const useWalletSyncing = (): boolean => {
  const store = useContext(WalletSyncingContext);

  if (!store) {
    throw new Error(
      "useWalletSyncing must be used within a WalletObserverProvider",
    );
  }

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
};
