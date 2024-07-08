import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useMemo } from "react";

import {
  TUseWalletObserverState,
  useWalletObserverContext,
} from "../contexts/observer/index.js";

/**
 * Exposes the WalletObserver state.
 *
 * @returns {TUseWalletObserverState<AssetMetadata>}
 */
export const useWalletObserver = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>(): TUseWalletObserverState<AssetMetadata> => {
  const { state } = useWalletObserverContext<AssetMetadata>();

  const memoizedState = useMemo(() => {
    const result: TUseWalletObserverState<AssetMetadata> = {
      ready: Boolean(state.activeWallet && state.observer.api),
      isCip45: state.isCip45,
      activeWallet: state.activeWallet,
      adaBalance: state.adaBalance,
      balance: state.balance,
      mainAddress: state.mainAddress,
      stakeAddress: state.stakeAddress,
      network: state.network,
      utxos: state.utxos,
      collateral: state.collateral,
      observer: state.observer,
      unusedAddresses: state.unusedAddresses,
      usedAddresses: state.usedAddresses,
      syncWallet: state.syncWallet,
      disconnect: state.disconnect,
      connectWallet: state.connectWallet,
      switching: state.switching,
    };

    return result;
  }, [
    state.activeWallet,
    state.adaBalance,
    state.balance,
    state.mainAddress,
    state.stakeAddress,
    state.network,
    state.observer,
    state.syncWallet,
    state.disconnect,
    state.connectWallet,
    state.unusedAddresses,
    state.usedAddresses,
    state.utxos,
    state.collateral,
    state.ready,
    state.isCip45,
    state.switching,
  ]);

  return memoizedState;
};
