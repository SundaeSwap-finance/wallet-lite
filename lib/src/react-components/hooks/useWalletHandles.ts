import { useCallback, useEffect, useMemo, useState } from "react";

import { IHandle } from "@koralabs/adahandle-sdk";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { TAssetAmountMap } from "../../@types/observer.js";
import { THandleMetadata } from "../contexts/observer/types.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletHandles = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>() => {
  const state = useWalletObserver<THandleMetadata<AssetMetadata>>();
  const [loadingHandles, setLoadingHandles] = useState(true);
  const [handles, setHandles] = useState<
    TAssetAmountMap<THandleMetadata<AssetMetadata>>
  >(new Map());
  const memoizedHandleDep = useMemo(
    () => [...state.balance.getHandles().keys()],
    [state.balance]
  );

  const syncHandles = useCallback<
    () => Promise<TAssetAmountMap<THandleMetadata<AssetMetadata>>>
  >(async () => {
    // Make a copy of our wallet map.
    const walletHandles: TAssetAmountMap<THandleMetadata<AssetMetadata>> =
      new Map([...state.balance.getHandles()]);

    if (walletHandles.size === 0) {
      setLoadingHandles(false);
      return walletHandles;
    }

    try {
      const {
        default: HandleClient,
        HandleClientContext,
        KoraLabsProvider,
      } = await import("@koralabs/adahandle-sdk");
      const context =
        state.network === 1
          ? HandleClientContext.MAINNET
          : HandleClientContext.PREVIEW;

      // @ts-ignore Type isn't exported from default.
      const sdk = new HandleClient({
        context,
        provider: new KoraLabsProvider(context),
      });

      // Restore once SDK updated
      const walletHandlesWithDataArray = [...walletHandles.entries()];
      const walletHandleDataArray: IHandle[] = await sdk
        .provider()
        .getAllDataBatch(
          walletHandlesWithDataArray.map(([key]) => ({ value: key.slice(56) }))
        );

      walletHandlesWithDataArray.forEach(([key, asset]) => {
        const matchingData = walletHandleDataArray.find(
          ({ hex }) => hex === key.slice(56)
        ) as IHandle;

        walletHandles.set(
          key,
          asset
            .withMetadata({
              ...matchingData,
              ...asset.metadata,
              decimals: 0,
            })
            .withAmount(1n)
        );
      });

      setLoadingHandles(false);
      return walletHandles;
    } catch (e) {
      setLoadingHandles(false);
      console.log(e);
      return walletHandles;
    }
    // We only want to update the callback if the Handle keys change.
  }, [state.balance, setLoadingHandles]);

  useEffect(() => {
    syncHandles().then((newHandles) => {
      setHandles((prevHandles) => {
        let handleMetadataChanged = false;

        if (newHandles.size !== prevHandles?.size) {
          handleMetadataChanged = true;
        } else {
          for (const [key, val] of newHandles) {
            if (
              !prevHandles.has(key) ||
              prevHandles.get(key)?.amount !== val?.amount
            ) {
              handleMetadataChanged = true;
            }
          }
        }

        if (!handleMetadataChanged) {
          return prevHandles;
        }

        return newHandles;
      });
    });
  }, [memoizedHandleDep, syncHandles, setHandles]);

  const data = useMemo(
    () => ({
      handles,
      loadingHandles,
    }),
    [handles, loadingHandles]
  );

  return data;
};
