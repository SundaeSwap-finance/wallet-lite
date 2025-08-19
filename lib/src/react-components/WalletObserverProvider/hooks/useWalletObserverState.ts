import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/TransactionUnspentOutput.js";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { useCallback, useEffect, useState, useTransition } from "react";

import { IWalletObserverSync } from "../../../@types/observer.js";
import { ReadOnlyApi } from "../../../classes/ReadOnlyApi.class.js";
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
  const [isReadOnlyMode, setIsReadOnlyMode] = useState<boolean>(false);
  const [network, setNetwork] = useState<number | undefined>();
  const [usedAddresses, setUsedAddresses] = useState<string[]>([]);
  const [unusedAddresses, setUnusedAddresses] = useState<string[]>([]);
  const [feeAddress, setFeeAddress] = useState<string | undefined>();
  const [utxos, setUtxos] = useState<TransactionUnspentOutput[]>();
  const [collateral, setCollateral] = useState<TransactionUnspentOutput[]>();
  const [isCip45, setIsCip45] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [errorSyncing, setErrorSyncing] = useState(false);
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
    setFeeAddress(undefined);
    setIsCip45(false);
    setWillAutoConnect(false);
  }, [observer]);

  const connectWallet = useCallback(
    async (wallet: string) => {
      if (observer.hasActiveConnection() && wallet !== observer.activeWallet) {
        setSwitching(() => true);
      }

      const data = await observer.connectWallet(wallet);
      setIsReadOnlyMode(observer.api instanceof ReadOnlyApi);
      await syncWallet(data instanceof Error ? undefined : data);
      setSwitching(() => false);
      return observer.api;
    },
    [observer, setSwitching, setIsReadOnlyMode],
  );

  const syncWallet = useCallback(
    async (importedData?: IWalletObserverSync<AssetMetadata> | undefined) => {
      if (observer.isSyncing() || !observer.hasActiveConnection()) {
        return;
      }

      const newWallet = observer.activeWallet;
      if (!newWallet) {
        disconnect();
        return;
      }

      setIsCip45(newWallet.includes("p2p"));
      setActiveWallet((prevWallet) =>
        newWallet === prevWallet ? prevWallet : newWallet,
      );
      setIsReadOnlyMode(observer.api instanceof ReadOnlyApi);

      try {
        const freshData = importedData || (await observer.sync());

        startTransition(() => {
          const newBalanceMap = freshData.balanceMap;
          if (newBalanceMap instanceof WalletBalanceMap) {
            const newAdaBalance = newBalanceMap.get(ADA_ASSET_ID);
            if (newAdaBalance) {
              setAdaBalance((prevBalance) =>
                prevBalance.amount === newAdaBalance.amount
                  ? prevBalance
                  : newAdaBalance,
              );

              setBalance((prevBalance) =>
                areAssetMapsEqual(prevBalance, newBalanceMap)
                  ? prevBalance
                  : newBalanceMap,
              );
            }
          }

          const newUsedAddresses = freshData.usedAddresses;
          if (newUsedAddresses instanceof Array) {
            setUsedAddresses((prevValue) => {
              return JSON.stringify(prevValue) ===
                JSON.stringify(newUsedAddresses)
                ? prevValue
                : newUsedAddresses;
            });
          }

          const newUnusedAddresses = freshData.unusedAddresses;
          if (newUnusedAddresses instanceof Array) {
            setUnusedAddresses((prevValue) =>
              JSON.stringify(prevValue) === JSON.stringify(newUnusedAddresses)
                ? prevValue
                : newUnusedAddresses,
            );
          }

          const newNetwork = freshData.network;
          if (typeof newNetwork === "number") {
            setNetwork((prevValue) =>
              prevValue === newNetwork ? prevValue : newNetwork,
            );
          }

          const newUtxos = freshData.utxos;
          if (newUtxos instanceof Array) {
            setUtxos((prevValue) => {
              const prevValueRep = prevValue?.map((v) => v.toCbor());
              const newValueRep = newUtxos?.map((v) => v.toCbor());
              if (prevValueRep !== newValueRep) {
                return newUtxos;
              }

              return prevValue;
            });
          }

          const newCollateral = freshData.collateral;
          if (newCollateral instanceof Array) {
            setCollateral((prevValue) => {
              const prevValueRep = prevValue?.map((v) => v.toCbor());
              const newValueRep = newCollateral?.map((v) => v.toCbor());
              if (prevValueRep !== newValueRep) {
                return newCollateral;
              }

              return prevValue;
            });
          }

          const newFeeAddress = freshData.feeAddress;
          if (typeof newFeeAddress === "string") {
            setFeeAddress((prevValue) =>
              prevValue === newFeeAddress ? prevValue : newFeeAddress,
            );
          }
        });
      } catch (e) {
        setErrorSyncing(true);
        (e as Error).cause =
          "The wallet threw an error while the app was trying to sync with it. Please try again or contact your wallet provider.";
        throw e;
      }
    },
    [observer, disconnect],
  );

  /**
   * Ensure the wallet syncs on connect and disconnect.
   */
  useEffect(() => {
    const func = () => syncWallet();
    window.addEventListener("focus", func);

    return () => {
      window.addEventListener("focus", func);
    };
  }, [syncWallet]);

  return {
    activeWallet,
    adaBalance,
    balance,
    collateral,
    connectWallet,
    disconnect,
    errorSyncing,
    feeAddress,
    isCip45,
    isPending,
    isReadOnlyMode,
    network,
    setActiveWallet,
    setAdaBalance,
    setBalance,
    setCollateral,
    setFeeAddress,
    setIsCip45,
    setIsReadOnlyMode,
    setNetwork,
    setSwitching,
    setUnusedAddresses,
    setUsedAddresses,
    setUtxos,
    switching,
    syncWallet,
    unusedAddresses,
    usedAddresses,
    utxos,
    willAutoConnect,
  };
};
