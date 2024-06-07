import { MutableRefObject, useRef } from "react";

import { EWalletObserverEvents } from "../../../@types/events";
import { IWalletObserverOptions } from "../../../@types/observer";
import { WalletObserver } from "../../../classes/WalletObserver.class";
import { onConnectHandler, onDisconnectHandler } from "../../../utils/handlers";

export const useProviderWalletObserverRef = (
  options?: IWalletObserverOptions
) => {
  // Use ref to store the observer instance, ensuring it's created only once
  const observerRef = useRef<WalletObserver | null>(null);

  // Initialize observer only once
  if (observerRef.current === null) {
    const observer = new WalletObserver(options);
    observer.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      onConnectHandler
    );

    observer.addEventListener(
      EWalletObserverEvents.DISCONNECT,
      onDisconnectHandler
    );

    observerRef.current = observer;
  }

  return observerRef as MutableRefObject<WalletObserver>;
};
