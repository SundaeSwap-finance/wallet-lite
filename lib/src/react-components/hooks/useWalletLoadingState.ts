import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useMemo } from "react";

import { useWalletObserverContext } from "../contexts/observer/context.js";

export const useWalletLoadingState = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>() => {
  const { state } = useWalletObserverContext<AssetMetadata>();

  const result = useMemo(
    () => ({
      connectingWallet: state.connectingWallet,
      syncingWallet: state.syncingWallet,
      ready: state.ready,
    }),
    [state.ready, state.syncingWallet, state.connectingWallet]
  );

  return result;
};
