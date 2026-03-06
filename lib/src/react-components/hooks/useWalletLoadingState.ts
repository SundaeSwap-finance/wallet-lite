import { useMemo } from "react";

import { useWalletConnectionContext } from "../contexts/observer/context.js";

export const useWalletLoadingState = () => {
  const connection = useWalletConnectionContext();

  const result = useMemo(
    () => ({
      connectingWallet: connection.connectingWallet,
      syncingWallet: connection.syncingWallet,
      switchingWallet: connection.switching,
      ready: connection.ready,
    }),
    [
      connection.ready,
      connection.syncingWallet,
      connection.connectingWallet,
      connection.switching,
    ],
  );

  return result;
};
