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
      isPending: state.isPending,
      willAutoConnect: state.willAutoConnect,
    }),
    [
      state.isCip45,
      state.activeWallet,
      state.adaBalance.amount,
      state.balance.size,
      state.mainAddress,
      state.stakeAddress,
      state.network,
      state.utxos,
      state.collateral,
      state.observer,
      state.unusedAddresses,
      state.usedAddresses,
      state.syncWallet,
      state.disconnect,
      state.connectWallet,
      state.switching,
      state.isPending,
      state.willAutoConnect,
    ],
  );

  return result;
};
