import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useMemo } from "react";

import {
  TUseWalletObserverState,
  useWalletObserverContext,
} from "../contexts/observer";

export const useWalletObserver = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>(): TUseWalletObserverState<AssetMetadata> => {
  const { state } = useWalletObserverContext<AssetMetadata>();

  const memoizedState = useMemo(() => {
    const result: TUseWalletObserverState<AssetMetadata> = {
      ready: state.ready,
      activeWallet: state.activeWallet,
      adaBalance: state.adaBalance,
      balance: state.balance,
      mainAddress: state.mainAddress,
      network: state.network,
      observer: state.observer,
      syncWallet: state.syncWallet,
      unusedAddresses: state.unusedAddresses,
      usedAddresses: state.usedAddresses,
    };

    return result;
  }, [
    state.activeWallet,
    state.adaBalance,
    state.balance,
    state.mainAddress,
    state.network,
    state.observer,
    state.syncWallet,
    state.unusedAddresses,
    state.usedAddresses,
    state.ready,
  ]);

  return memoizedState;
};
