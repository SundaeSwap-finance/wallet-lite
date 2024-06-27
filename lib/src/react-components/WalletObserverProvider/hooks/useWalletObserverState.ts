import { AssetAmount } from "@sundaeswap/asset";
import { useCallback, useRef, useState } from "react";

import {
  TAssetAmountMap,
  TSupportedWalletExtensions,
} from "../../../@types/observer.js";
import { WalletBalanceMap } from "../../../classes/WalletBalanceMap.class.js";
import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import { areAssetMapsEqual } from "../../../utils/comparisons.js";
import { THandleMetadata } from "../../contexts/observer/index.js";

/**
 * Internal use only. The main action that sync WalletObserver api responses with
 * the React context of the WalletObserverProvider.
 *
 * @param {WalletObserver} observer
 */
export const useWalletObserverState = (observer: WalletObserver) => {
  const prevActiveWallet = useRef<TSupportedWalletExtensions>();
  const [activeWallet, setActiveWallet] =
    useState<TSupportedWalletExtensions>();
  const [adaBalance, setAdaBalance] = useState<AssetAmount>(
    new AssetAmount(0n)
  );
  const [handleMetadata, setHandleMetadata] = useState<
    TAssetAmountMap<THandleMetadata>
  >(new Map());
  const [balance, setBalance] = useState<WalletBalanceMap>(
    new WalletBalanceMap(observer)
  );
  const [network, setNetwork] = useState<number | undefined>();
  const [usedAddresses, setUsedAddresses] = useState<string[]>([]);
  const [unusedAddresses, setUnusedAddresses] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [isCip45, setIsCip45] = useState(false);

  const syncWallet = useCallback(async () => {
    if (observer.isSyncing()) {
      return;
    }

    const newWallet = observer.getActiveWallet();

    if (!newWallet) {
      setAdaBalance(new AssetAmount(0n));
      setBalance(new WalletBalanceMap(observer));
      setUsedAddresses([]);
      setUnusedAddresses([]);
      setActiveWallet(undefined);
      setNetwork(undefined);
      return;
    }

    prevActiveWallet.current = newWallet;
    setActiveWallet((prevWallet) =>
      newWallet === prevWallet ? prevWallet : newWallet
    );

    const freshData = await observer.sync();

    const newAdaBalance = freshData.balanceMap.get(WalletObserver.ADA_ASSET_ID);
    if (newAdaBalance) {
      setAdaBalance((prevBalance) =>
        prevBalance.amount === newAdaBalance.amount
          ? prevBalance
          : newAdaBalance
      );
    }

    setBalance((prevBalance) =>
      areAssetMapsEqual(prevBalance, freshData.balanceMap)
        ? prevBalance
        : freshData.balanceMap
    );

    setUsedAddresses((prevValue) =>
      JSON.stringify(prevValue) === JSON.stringify(freshData.usedAddresses)
        ? prevValue
        : freshData.usedAddresses
    );

    setUnusedAddresses((prevValue) =>
      JSON.stringify(prevValue) === JSON.stringify(freshData.unusedAddresses)
        ? prevValue
        : freshData.unusedAddresses
    );

    setNetwork((prevValue) =>
      prevValue === freshData.network ? prevValue : freshData.network
    );

    setReady(true);
    setIsCip45(newWallet.includes("p2p"));
  }, [observer]);

  return {
    activeWallet,
    setActiveWallet,
    adaBalance,
    setAdaBalance,
    balance,
    setBalance,
    handles: handleMetadata,
    setHandles: setHandleMetadata,
    isCip45,
    setIsCip45,
    network,
    setNetwork,
    unusedAddresses,
    setUnusedAddresses,
    usedAddresses,
    setUsedAddresses,
    syncWallet,
    ready,
    setReady,
  };
};
