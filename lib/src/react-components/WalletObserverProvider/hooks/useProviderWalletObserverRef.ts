import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { EWalletObserverEvents } from "../../../@types/events.js";
import {
  IWalletObserverSync,
  TWalletObserverOptions,
} from "../../../@types/observer.js";
import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import { TWalletProviderHooks } from "../../contexts/observer/index.js";

/**
 * Internal use only. This hook is responsible for initiating the
 * WalletObserver instance once, and assigning it to a ref.
 *
 * @param {TWalletObserverOptions} [options]
 * @param {TWalletProviderHooks}
 */
export const useProviderWalletObserverRef = (
  options?: TWalletObserverOptions,
  hooks?: TWalletProviderHooks,
) => {
  // Use ref to store the observer instance, ensuring it's created only once
  const observerRef = useRef<WalletObserver | null>(null);

  // Initialize observer only once
  if (observerRef.current === null) {
    const observer = new WalletObserver(options);
    observerRef.current = observer;
  }

  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [eventListenersAttached, setEventListenersAttached] = useState(false);

  const ready = useMemo(() => {
    return Boolean(
      observerRef.current &&
        observerRef.current.api &&
        observerRef.current.activeWallet,
    );
  }, [observerRef, observerRef.current.api, observerRef.current.activeWallet]);

  /**
   * Add user-defined hooks into the event stream.
   */
  useEffect(() => {
    if (!observerRef.current) {
      return;
    }

    const setConnectingStart = () => {
      (async () => {
        setConnecting(() => true);
        await hooks?.onConnectWalletStart?.();
      })().catch(console.error);
    };
    const setConnectingEnd = (
      data?: IWalletObserverSync<IAssetAmountMetadata> & {
        activeWallet: string;
      },
    ) => {
      (async () => {
        setConnecting(() => false);
        await hooks?.onConnectWalletEnd?.(data);
      })().catch(console.error);
    };
    const setSyncingStart = () => {
      (async () => {
        setSyncing(() => true);
        await hooks?.onSyncWalletStart?.();
      })().catch(console.error);
    };
    const setSyncingEnd = (
      data?: IWalletObserverSync<IAssetAmountMetadata> & {
        activeWallet: string;
      },
    ) => {
      (async () => {
        await hooks?.onSyncWalletEnd?.(data);
        setSyncing(() => false);
      })().catch(console.error);
    };
    const onDisconnect = () => {
      (async () => {
        hooks?.onDisconnectWallet?.();
      })().catch(console.error);
    };

    observerRef.current.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      setConnectingStart,
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      setConnectingEnd,
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_START,
      setSyncingStart,
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_END,
      setSyncingEnd,
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.DISCONNECT,
      onDisconnect,
    );

    setEventListenersAttached(() => true);

    return () => {
      if (!observerRef.current) {
        return;
      }

      observerRef.current.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_START,
        setConnectingStart,
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_END,
        setConnectingEnd,
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_START,
        setSyncingStart,
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_END,
        setSyncingEnd,
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.DISCONNECT,
        onDisconnect,
      );
    };
  }, [observerRef, hooks]);

  return {
    observerRef: observerRef as MutableRefObject<WalletObserver>,
    connectingWallet: connecting,
    syncingWallet: syncing,
    ready,
    eventListenersAttached,
  };
};
