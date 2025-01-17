import { useEffect, useMemo, useState } from "react";
import { IWalletObserverSeed } from "../../../../@types/observer.js";
import { WalletObserver } from "../../../../classes/WalletObserver.class.js";
import { useWalletObserverState } from "../useWalletObserverState.js";

export const useDerivedState = (
  observer: WalletObserver,
  state: Pick<
    ReturnType<typeof useWalletObserverState>,
    "usedAddresses" | "unusedAddresses"
  >,
) => {
  const [stakeAddress, setStakeAddress] = useState<string>();

  useEffect(() => {
    if (!state.usedAddresses[0] && !state.unusedAddresses[0]) {
      return;
    }

    observer.getUtils().then((utils) => {
      setStakeAddress(
        utils.getBech32StakingAddress(
          state.usedAddresses[0] || state.unusedAddresses[0],
        ),
      );
    });
  }, [state.usedAddresses[0] || state.unusedAddresses[0]]);

  const memoizedDerivedState = useMemo(() => {
    let mainAddress = state.usedAddresses[0] || state.unusedAddresses[0];
    const persistentCache = window.localStorage.getItem(
      WalletObserver.PERSISTENCE_CACHE_KEY,
    );
    const usePersistence = observer.getOptions().persistence;

    if (usePersistence && persistentCache && !mainAddress) {
      const cache = JSON.parse(persistentCache) as IWalletObserverSeed;
      mainAddress = cache.mainAddress;
    }

    return {
      stakeAddress,
      mainAddress,
    };
  }, [
    observer,
    state.usedAddresses[0],
    state.unusedAddresses[0],
    stakeAddress,
  ]);

  return memoizedDerivedState;
};
