import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { useMemo } from "react";
import {
  TUseWalletObserverState,
  useWalletObserverContext,
} from "../contexts/observer/index.js";

/**
 * Exposes the WalletObserver state.
 *
 * @returns {Omit<TUseWalletObserverState<AssetMetadata>, "ready" | "connectingWallet" | "syncingWallet">}
 */
export const useWalletObserver = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(): Omit<
  TUseWalletObserverState<AssetMetadata>,
  "ready" | "connectingWallet" | "syncingWallet"
> => {
  const { state } = useWalletObserverContext<AssetMetadata>();

  const result: Omit<
    TUseWalletObserverState<AssetMetadata>,
    "ready" | "connectingWallet" | "syncingWallet"
  > = useMemo(
    () => ({
      activeWallet: state.activeWallet,
      adaBalance: state.adaBalance,
      balance: state.balance,
      collateral: state.collateral,
      connectWallet: state.connectWallet,
      disconnect: state.disconnect,
      errorSyncing: state.errorSyncing,
      feeAddress: state.feeAddress,
      isCip45: state.isCip45,
      isPending: state.isPending,
      mainAddress: state.mainAddress,
      network: state.network,
      observer: state.observer,
      stakeAddress: state.stakeAddress,
      switching: state.switching,
      syncWallet: state.syncWallet,
      unusedAddresses: state.unusedAddresses,
      usedAddresses: state.usedAddresses,
      utxos: state.utxos,
      willAutoConnect: state.willAutoConnect,
    }),
    [
      state.activeWallet,
      state.adaBalance.amount,
      state.balance.size,
      state.collateral,
      state.connectWallet,
      state.disconnect,
      state.errorSyncing,
      state.feeAddress,
      state.isCip45,
      state.isPending,
      state.mainAddress,
      state.network,
      state.observer,
      state.stakeAddress,
      state.switching,
      state.syncWallet,
      state.unusedAddresses,
      state.usedAddresses,
      state.utxos,
      state.willAutoConnect,
    ],
  );

  return result;
};
