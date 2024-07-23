import { useEffect, useMemo, useState } from "react";
import { WalletObserver } from "../../../../classes/WalletObserver.class.js";
import { useWalletObserverState } from "../useWalletObserverState.js";

export const useDerivedState = (
  observer: WalletObserver,
  state: Pick<ReturnType<typeof useWalletObserverState>, "usedAddresses">,
) => {
  const [stakeAddress, setStakeAddress] = useState<string>();

  useEffect(() => {
    if (state.usedAddresses.length === 0) {
      return;
    }

    observer.getUtils().then((utils) => {
      setStakeAddress(utils.getBech32StakingAddress(state.usedAddresses[0]));
    });
  }, [observer, state.usedAddresses[0]]);

  const memoizedDerivedState = useMemo(
    () => ({
      stakeAddress,
      mainAddress: state.usedAddresses[0],
    }),
    [state.usedAddresses[0], stakeAddress],
  );

  return memoizedDerivedState;
};
