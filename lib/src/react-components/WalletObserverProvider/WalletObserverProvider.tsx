import { FC, PropsWithChildren, useEffect, useMemo } from "react";

import { WalletObserver } from "../../classes/WalletObserver.class.js";
import {
  IWalletObserverProviderProps,
  IWalletObserverState,
  WalletActionsContext,
  WalletConnectionContext,
  WalletDataContext,
  WalletObserverContext,
} from "../contexts/observer/index.js";
import { useDerivedState } from "./hooks/effects/useDerivedState.js";
import { useSyncWalletWithInterval } from "./hooks/effects/useSyncWalletWithInterval.js";
import { useProviderWalletObserverRef } from "./hooks/useProviderWalletObserverRef.js";
import { useWalletObserverState } from "./hooks/useWalletObserverState.js";

/**
 * The main context provider component. This handles setting up all the initial
 * state, handlers, and side effects with a new WalletObserver class.
 *
 * @param {IWalletObserverProviderProps} [options]
 * @returns {FC<PropsWithChildren<IWalletObserverProviderProps>>}
 */
const WalletObserverProvider: FC<
  PropsWithChildren<IWalletObserverProviderProps>
> = ({ children, options, loading = false }) => {
  const {
    observerRef,
    connectingWallet,
    syncingWallet,
    ready,
    eventListenersAttached,
  } = useProviderWalletObserverRef(options?.observerOptions, options?.hooks);
  const state = useWalletObserverState(observerRef.current);

  // Enable syncing only when not loading.
  useSyncWalletWithInterval(
    state.syncWallet,
    loading ? undefined : options?.refreshInterval,
  );

  const derivedState = useDerivedState(observerRef.current, {
    usedAddresses: state.usedAddresses,
    unusedAddresses: state.unusedAddresses,
    changeAddress: state.changeAddress,
  });

  // Focused context: stable callbacks and observer ref.
  // Only changes when observer instance is recreated.
  const actionsValue = useMemo(
    () => ({
      observer: observerRef.current,
      observerRef: observerRef,
      connectWallet: state.connectWallet,
      disconnect: state.disconnect,
      syncWallet: state.syncWallet,
      resyncMetadata: state.resyncMetadata,
    }),
    [
      state.connectWallet,
      state.disconnect,
      state.syncWallet,
      state.resyncMetadata,
    ],
  );

  // Focused context: connection and loading state.
  // Changes on connect/disconnect and sync start/end.
  const connectionValue = useMemo(
    () => ({
      activeWallet: state.activeWallet,
      ready,
      connectingWallet,
      syncingWallet,
      network: state.network,
      isCip45: state.isCip45,
      switching: state.switching,
      isReadOnlyMode: state.isReadOnlyMode,
      willAutoConnect: state.willAutoConnect,
      errorSyncing: state.errorSyncing,
      mainAddress: derivedState.mainAddress,
      stakeAddress: derivedState.stakeAddress,
    }),
    [
      state.activeWallet,
      ready,
      connectingWallet,
      syncingWallet,
      state.network,
      state.isCip45,
      state.switching,
      state.isReadOnlyMode,
      state.willAutoConnect,
      state.errorSyncing,
      derivedState.mainAddress,
      derivedState.stakeAddress,
    ],
  );

  // Focused context: wallet data that changes every sync cycle.
  const dataValue = useMemo(
    () => ({
      balance: state.balance,
      adaBalance: state.adaBalance,
      usedAddresses: state.usedAddresses,
      unusedAddresses: state.unusedAddresses,
      changeAddress: state.changeAddress,
      feeAddress: state.feeAddress,
      utxos: state.utxos,
      collateral: state.collateral,
      isPending: state.isPending,
      refreshInterval: options?.refreshInterval || 30000,
    }),
    [
      state.balance,
      state.adaBalance,
      state.usedAddresses,
      state.unusedAddresses,
      state.changeAddress,
      state.feeAddress,
      state.utxos,
      state.collateral,
      state.isPending,
      options?.refreshInterval,
    ],
  );

  // Backward-compatible full context value
  const contextValue: IWalletObserverState = useMemo(
    () => ({
      observerRef: observerRef,
      refreshInterval: options?.refreshInterval || 30000,
      state: {
        ...state,
        ...derivedState,
        observer: observerRef.current,
        connectingWallet,
        syncingWallet,
        ready,
      },
    }),
    [
      options?.refreshInterval,
      state,
      derivedState,
      connectingWallet,
      syncingWallet,
      ready,
    ],
  );

  useEffect(() => {
    if (!eventListenersAttached || loading) {
      return;
    }

    const wallet = window.localStorage.getItem(
      WalletObserver.PERSISTENCE_CACHE_KEY,
    );

    if (wallet && observerRef.current?.getOptions()?.persistence) {
      state.connectWallet(JSON.parse(wallet).activeWallet);
    }
  }, [eventListenersAttached, loading]);

  return (
    <WalletObserverContext.Provider value={contextValue}>
      <WalletActionsContext.Provider value={actionsValue}>
        <WalletConnectionContext.Provider value={connectionValue}>
          <WalletDataContext.Provider value={dataValue}>
            {children}
          </WalletDataContext.Provider>
        </WalletConnectionContext.Provider>
      </WalletActionsContext.Provider>
    </WalletObserverContext.Provider>
  );
};

export default WalletObserverProvider;
