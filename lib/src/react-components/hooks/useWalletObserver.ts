import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { useMemo } from "react";
import {
  TUseWalletObserverState,
  useWalletObserverContext,
} from "../contexts/observer/index.js";

/**
 * Exposes the WalletObserver state. It doesn't change when a sync starts or
 * ends, or when a sync returns the same data: read the syncing flag with
 * `useWalletSyncing`.
 *
 * @returns {Omit<TUseWalletObserverState<AssetMetadata>, "ready" | "connectingWallet">}
 */
export const useWalletObserver = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(): Omit<
  TUseWalletObserverState<AssetMetadata>,
  "ready" | "connectingWallet"
> => {
  const { state } = useWalletObserverContext<AssetMetadata>();

  const result: Omit<
    TUseWalletObserverState<AssetMetadata>,
    "ready" | "connectingWallet"
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
      isReadOnlyMode: state.isReadOnlyMode,
      mainAddress: state.mainAddress,
      changeAddress: state.changeAddress,
      network: state.network,
      observer: state.observer,
      resyncMetadata: state.resyncMetadata,
      stakeAddress: state.stakeAddress,
      switching: state.switching,
      syncWallet: state.syncWallet,
      unusedAddresses: state.unusedAddresses,
      usedAddresses: state.usedAddresses,
      utxos: state.utxos,
      willAutoConnect: state.willAutoConnect,
    }),
    [
      state.changeAddress,
      state.activeWallet,
      state.adaBalance.amount,
      state.balance,
      state.collateral,
      state.connectWallet,
      state.disconnect,
      state.errorSyncing,
      state.feeAddress,
      state.isCip45,
      state.isReadOnlyMode,
      state.mainAddress,
      state.network,
      state.observer,
      state.resyncMetadata,
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
