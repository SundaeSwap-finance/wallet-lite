import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/index.js";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { useCallback, useEffect, useState, useTransition } from "react";

import { WalletBalanceMap } from "../../../classes/WalletBalanceMap.class.js";
import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import { ADA_ASSET_ID } from "../../../constants.js";
import { areAssetMapsEqual } from "../../../utils/comparisons.js";

/**
 * Internal use only. The main action that sync WalletObserver api responses with
 * the React context of the WalletObserverProvider.
 *
 * @param {WalletObserver} observer
 */
export const useWalletObserverState = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(
  observer: WalletObserver<AssetMetadata>,
) => {
  const [activeWallet, setActiveWallet] = useState<string>();
  const [adaBalance, setAdaBalance] = useState<AssetAmount<AssetMetadata>>(
    new AssetAmount<AssetMetadata>(0n),
  );
  const [balance, setBalance] = useState<WalletBalanceMap<AssetMetadata>>(
    new WalletBalanceMap<AssetMetadata>(observer),
  );
  const [network, setNetwork] = useState<number | undefined>();
  const [usedAddresses, setUsedAddresses] = useState<string[]>([]);
  const [unusedAddresses, setUnusedAddresses] = useState<string[]>([]);
  const [utxos, setUtxos] = useState<TransactionUnspentOutput[]>();
  const [collateral, setCollateral] = useState<TransactionUnspentOutput[]>();
  const [isCip45, setIsCip45] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [willAutoConnect, setWillAutoConnect] = useState(
    Boolean(
      window.localStorage.getItem(WalletObserver.PERSISTENCE_CACHE_KEY) &&
        observer.getOptions().persistence,
    ),
  );

  const disconnect = useCallback(() => {
    // Reset observer state.
    observer.disconnect();

    // Reset state.
    setAdaBalance(new AssetAmount(0n));
    setBalance(new WalletBalanceMap(observer));
    setUsedAddresses([]);
    setUnusedAddresses([]);
    setActiveWallet(undefined);
    setNetwork(undefined);
    setUtxos(undefined);
    setCollateral(undefined);
    setIsCip45(false);
    setWillAutoConnect(false);
  }, [observer]);

  const syncWallet = useCallback(async () => {
    if (observer.isSyncing() || !observer.hasActiveConnection()) {
      return;
    }

    const newWallet = observer.activeWallet;
    if (!newWallet) {
      disconnect();
      return;
    }

    const freshData = await observer.sync();

    startTransition(() => {
      setActiveWallet((prevWallet) =>
        newWallet === prevWallet ? prevWallet : newWallet,
      );

      const newAdaBalance = freshData.balanceMap.get(ADA_ASSET_ID);
      if (newAdaBalance) {
        setAdaBalance((prevBalance) =>
          prevBalance.amount === newAdaBalance.amount
            ? prevBalance
            : newAdaBalance,
        );
      }

      setBalance((prevBalance) =>
        areAssetMapsEqual(prevBalance, freshData.balanceMap)
          ? prevBalance
          : freshData.balanceMap,
      );

      setUsedAddresses((prevValue) =>
        JSON.stringify(prevValue) === JSON.stringify(freshData.usedAddresses)
          ? prevValue
          : freshData.usedAddresses,
      );

      setUnusedAddresses((prevValue) =>
        JSON.stringify(prevValue) === JSON.stringify(freshData.unusedAddresses)
          ? prevValue
          : freshData.unusedAddresses,
      );

      setNetwork((prevValue) =>
        prevValue === freshData.network ? prevValue : freshData.network,
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

      setIsCip45(newWallet.includes("p2p"));
    });
  }, [observer, disconnect]);

  const connectWallet = useCallback(
    async (wallet: string) => {
      if (observer.hasActiveConnection() && wallet !== observer.activeWallet) {
        setSwitching(() => true);
      }

      await observer.connectWallet(wallet);
      await syncWallet();
      setSwitching(() => false);
      return observer.api;
    },
    [observer, setSwitching],
  );

  /**
   * Ensure the wallet syncs on connect and disconnect.
   */
  useEffect(() => {
    window.addEventListener("focus", syncWallet);

    return () => {
      window.addEventListener("focus", syncWallet);
    };
  }, [syncWallet]);

  return {
    activeWallet,
    setActiveWallet,
    adaBalance,
    setAdaBalance,
    balance,
    setBalance,
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
    isPending,
    willAutoConnect,
  };
};
