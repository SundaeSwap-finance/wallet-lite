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
  const ready = useMemo(() => {
    return Boolean(state.observer.api && state.observer.activeWallet);
  }, [state.observer.api, state.observer.activeWallet]);

  useEffect(() => {
    if (!state.observer) {
      return;
    }

    const setConnectingStart = () => {
      setConnecting(true);
    };
    const setConnectingEnd = () => {
      setConnecting(false);
    };
    const setSyncingStart = () => {
      setSyncing(true);
    };
    const setSyncingEnd = () => {
      setSyncing(false);
    };

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
    };
  }, [state.observer, setConnecting, setSyncing]);

  return {
    connectingWallet: connecting,
    syncingWallet: syncing,
    ready,
  };
};
