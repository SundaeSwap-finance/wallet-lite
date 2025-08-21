import { useEffect, useMemo, useState } from "react";
import { IWalletObserverSeed } from "../../../../@types/observer.js";
import { WalletObserver } from "../../../../classes/WalletObserver.class.js";
import { useWalletObserverState } from "../useWalletObserverState.js";

export const useDerivedState = (
  observer: WalletObserver,
  state: Pick<
    ReturnType<typeof useWalletObserverState>,
    "usedAddresses" | "unusedAddresses" | "changeAddress"
  >,
) => {
  const [stakeAddress, setStakeAddress] = useState<string>();
  const address =
    state.changeAddress || state.usedAddresses[0] || state.unusedAddresses[0];

  useEffect(() => {
    if (!address) {
      return;
    }

    observer.getUtils().then((utils) => {
      setStakeAddress(utils.getBech32StakingAddress(address));
    });
  }, [address]);

  const memoizedDerivedState = useMemo(() => {
    const persistentCache = window.localStorage.getItem(
      WalletObserver.PERSISTENCE_CACHE_KEY,
    );
    const usePersistence = observer.getOptions().persistence;

    let mainAddress = address;
    if (usePersistence && persistentCache && !mainAddress) {
      const cache = JSON.parse(persistentCache) as IWalletObserverSeed;
      mainAddress = cache.mainAddress;
    }

    return {
      stakeAddress,
      mainAddress,
    };
  }, [observer, address, stakeAddress]);

  return memoizedDerivedState;
};
