import { useMemo } from "react";

import { useWalletConnectionContext } from "../contexts/observer/context.js";

/**
 * Connection loading state. It doesn't change when a sync starts or ends:
 * read that with `useWalletSyncing`.
 */
export const useWalletLoadingState = () => {
  const connection = useWalletConnectionContext();

  const result = useMemo(
    () => ({
      connectingWallet: connection.connectingWallet,
      switchingWallet: connection.switching,
      ready: connection.ready,
    }),
    [connection.ready, connection.connectingWallet, connection.switching],
  );

  return result;
};
