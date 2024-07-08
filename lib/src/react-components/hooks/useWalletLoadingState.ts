import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useEffect, useMemo, useState } from "react";

import { EWalletObserverEvents } from "../../@types/events.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletLoadingState = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>() => {
  const state = useWalletObserver<AssetMetadata>();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!state.observer) {
      return;
    }

    const setConnectingStart = () => {
      setConnecting(true);
    };
    const setConnectingEnd = () => {
      setConnecting(false);
      setReady(true);
    };
    const setSyncingStart = () => {
      setSyncing(true);
    };
    const setSyncingEnd = () => {
      setSyncing(false);
    };
    const onDisconnect = () => setReady(false);

    state.observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      setConnectingStart
    );
    state.observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      setConnectingEnd
    );
    state.observer.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_START,
      setSyncingStart
    );
    state.observer.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_END,
      setSyncingEnd
    );
    state.observer.addEventListener(
      EWalletObserverEvents.DISCONNECT,
      onDisconnect
    );

    return () => {
      state.observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_START,
        setConnectingStart
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_END,
        setConnectingEnd
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_START,
        setSyncingStart
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_END,
        setSyncingEnd
      );
      state.observer.removeEventListener(
        EWalletObserverEvents.DISCONNECT,
        onDisconnect
      );
    };
  }, [state.observer, setConnecting, setSyncing, setReady]);

  const memoizedState = useMemo(
    () => ({
      connectingWallet: connecting,
      syncingWallet: syncing,
      ready,
    }),
    [connecting, syncing, ready]
  );

  return memoizedState;
};
