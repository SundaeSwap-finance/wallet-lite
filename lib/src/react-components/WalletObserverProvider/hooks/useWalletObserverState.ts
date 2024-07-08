import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/index.js";
import { AssetAmount } from "@sundaeswap/asset";
import { useCallback, useState } from "react";

import {
  TAssetAmountMap,
  TSupportedWalletExtensions,
} from "../../../@types/observer.js";
import { WalletAssetMap } from "../../../classes/WalletAssetMap.class.js";
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
  const [activeWallet, setActiveWallet] =
    useState<TSupportedWalletExtensions>();
  const [adaBalance, setAdaBalance] = useState<AssetAmount>(
    new AssetAmount(0n)
  );
  const [handleMetadata, setHandleMetadata] = useState<
    TAssetAmountMap<THandleMetadata>
  >(new WalletAssetMap());
  const [balance, setBalance] = useState<WalletBalanceMap>(
    new WalletBalanceMap(observer)
  );
  const [network, setNetwork] = useState<number | undefined>();
  const [usedAddresses, setUsedAddresses] = useState<string[]>([]);
  const [unusedAddresses, setUnusedAddresses] = useState<string[]>([]);
  const [utxos, setUtxos] = useState<TransactionUnspentOutput[]>();
  const [collateral, setCollateral] = useState<TransactionUnspentOutput[]>();
  const [ready, setReady] = useState(false);
  const [isCip45, setIsCip45] = useState(false);
  const [switching, setSwitching] = useState(false);

  const disconnect = useCallback(() => {
    // Reset observer state.
    observer.disconnect();

    // Reset state.
    setAdaBalance(new AssetAmount(0n));
    setBalance(new WalletBalanceMap(observer));
    setHandleMetadata(new WalletAssetMap());
    setUsedAddresses([]);
    setUnusedAddresses([]);
    setActiveWallet(undefined);
    setNetwork(undefined);
    setUtxos(undefined);
    setCollateral(undefined);
    setReady(false);
    setIsCip45(false);
  }, [observer]);

  const syncWallet = useCallback(async () => {
    if (observer.isSyncing() || !observer.hasActiveConnection()) {
      return;
    }

    const newWallet = observer.getActiveWallet();
    if (!newWallet) {
      disconnect();
      return;
    }

    const freshData = await observer.sync();

    setActiveWallet((prevWallet) =>
      newWallet === prevWallet ? prevWallet : newWallet
    );

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

    setUtxos((prevValue) => {
      const prevValueRep = prevValue?.map((v) => v.toCbor());
      const newValueRep = freshData.utxos?.map((v) => v.toCbor());
      if (prevValueRep !== newValueRep) {
        return freshData.utxos;
      }

      return prevValue;
    });

    setCollateral((prevValue) => {
      const prevValueRep = prevValue?.map((v) => v.toCbor());
      const newValueRep = freshData.utxos?.map((v) => v.toCbor());
      if (prevValueRep !== newValueRep) {
        return freshData.utxos;
      }

      return prevValue;
    });

    setReady(true);
    setIsCip45(newWallet.includes("p2p"));
  }, [observer, disconnect]);

  const connectWallet = useCallback(
    async (wallet: TSupportedWalletExtensions) => {
      if (
        observer.hasActiveConnection() &&
        wallet !== observer.getActiveWallet()
      ) {
        setSwitching(true);
      }

      await observer.connectWallet(wallet).then(syncWallet);
      setSwitching(false);
    },
    [observer, setSwitching]
  );

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
    utxos,
    setUtxos,
    collateral,
    setCollateral,
    syncWallet,
    disconnect,
    connectWallet,
    switching,
    setSwitching,
    ready,
    setReady,
  };
};
