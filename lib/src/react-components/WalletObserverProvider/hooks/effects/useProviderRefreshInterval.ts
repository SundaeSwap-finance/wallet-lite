import { useEffect } from "react";

import { WalletObserver } from "../../../../classes/WalletObserver.class.js";

/**
 * Internal use only. This hook is responsible for attaching
 * a refresh interval to the WalletObserver. If set to 0, then
 * the refresh interval is not attached.
 *
 * @param observer
 * @param refreshInterval
 * @param syncWallet
 */
export const useProviderRefreshInterval = (
  observer: WalletObserver,
  syncWallet: () => Promise<void>,
  refreshInterval?: number
) => {
  useEffect(() => {
    if (!refreshInterval) {
      return;
    }

    const interval = setInterval(syncWallet, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval, syncWallet, observer]);
};
