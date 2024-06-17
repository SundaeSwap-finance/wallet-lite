import { MutableRefObject, useRef } from "react";

import { TWalletObserverOptions } from "../../../@types/observer.js";
import { WalletObserver } from "../../../classes/WalletObserver.class.js";

/**
 * Internal use only. This hook is responsible for initiating the
 * WalletObserver instance once, and assigning it to a ref.
 *
 * @param {TWalletObserverOptions} [options]
 * @returns {MutableRefObject<WalletObserver>}
 */
export const useProviderWalletObserverRef = (
  options?: TWalletObserverOptions
): MutableRefObject<WalletObserver> => {
  // Use ref to store the observer instance, ensuring it's created only once
  const observerRef = useRef<WalletObserver | null>(null);

  // Initialize observer only once
  if (observerRef.current === null) {
    const observer = new WalletObserver(options);
    observerRef.current = observer;
  }

  return observerRef as MutableRefObject<WalletObserver>;
};
