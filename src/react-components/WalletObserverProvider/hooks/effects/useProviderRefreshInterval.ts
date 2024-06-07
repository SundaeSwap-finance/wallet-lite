import { useEffect } from "react";

import { WalletObserver } from "../../../../classes/WalletObserver.class";

export const useProviderRefreshInterval = (
  refreshInterval: number,
  syncWallet: () => Promise<void>,
  observer: WalletObserver
) => {
  useEffect(() => {
    if (!refreshInterval) {
      return;
    }

    const interval = setInterval(() => {
      if (!observer.getActiveWallet()) {
        return;
      }

      syncWallet();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval, syncWallet, observer]);
};
