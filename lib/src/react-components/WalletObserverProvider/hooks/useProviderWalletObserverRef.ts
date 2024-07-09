import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

import { EWalletObserverEvents } from "../../../@types/events.js";
import { TWalletObserverOptions } from "../../../@types/observer.js";
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
  hooks?: TWalletProviderHooks
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
        observerRef.current.activeWallet
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
      setConnecting(() => true);
      hooks?.onConnectWalletStart?.();
    };
    const setConnectingEnd = () => {
      setConnecting(() => false);
      hooks?.onConnectWalletEnd?.();
    };
    const setSyncingStart = () => {
      setSyncing(() => true);
      hooks?.onSyncWalletStart?.();
    };
    const setSyncingEnd = () => {
      hooks?.onSyncWalletEnd?.();
      setSyncing(() => false);
    };

    observerRef.current.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      setConnectingStart
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      setConnectingEnd
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_START,
      setSyncingStart
    );
    observerRef.current.addEventListener(
      EWalletObserverEvents.SYNCING_WALLET_END,
      setSyncingEnd
    );

    setEventListenersAttached(() => true);

    return () => {
      if (!observerRef.current) {
        return;
      }

      observerRef.current.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_START,
        setConnectingStart
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.CONNECT_WALLET_END,
        setConnectingEnd
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_START,
        setSyncingStart
      );
      observerRef.current.removeEventListener(
        EWalletObserverEvents.SYNCING_WALLET_END,
        setSyncingEnd
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
