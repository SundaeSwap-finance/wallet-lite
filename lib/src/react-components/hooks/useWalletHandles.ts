import { useCallback, useEffect, useMemo, useState } from "react";

import { IHandle } from "@koralabs/adahandle-sdk";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { TAssetAmountMap } from "../../@types/observer.js";
import { WalletAssetMap } from "../../classes/WalletAssetMap.class.js";
import { normalizeAssetIdWithDot } from "../../utils/assets.js";
import { THandleMetadata } from "../contexts/observer/types.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletHandles = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
>() => {
  const state = useWalletObserver<THandleMetadata<AssetMetadata>>();
  const [loadingHandles, setLoadingHandles] = useState(true);
  const [handles, setHandles] = useState<
    TAssetAmountMap<THandleMetadata<AssetMetadata>>
  >(new WalletAssetMap());
  const memoizedHandleDep = useMemo(
    () => [...state.balance.getHandles().keys()],
    [state.balance]
  );

  const syncHandles = useCallback<
    () => Promise<TAssetAmountMap<THandleMetadata<AssetMetadata>>>
  >(async () => {
    // Make a copy of our wallet map.
    const walletHandles: TAssetAmountMap<THandleMetadata<AssetMetadata>> =
      new WalletAssetMap([...state.balance.getHandles()]);

    if (walletHandles.size === 0) {
      return walletHandles;
    }

    try {
      await import("@koralabs/adahandle-sdk").then(
        async ({
          default: HandleClient,
          HandleClientContext,
          KoraLabsProvider,
        }) => {
          setLoadingHandles(true);
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
              walletHandlesWithDataArray.map(([key]) => ({
                value: key.split(".")[1],
              }))
            );

          walletHandlesWithDataArray.forEach(([key, asset]) => {
            const matchingData = walletHandleDataArray.find(
              ({ hex }) => hex === key.split(".")[1]
            ) as IHandle;

            walletHandles.set(
              normalizeAssetIdWithDot(key),
              asset
                .withMetadata({
                  ...matchingData,
                  ...asset.metadata,
                  assetId: normalizeAssetIdWithDot(asset.metadata.assetId),
                  decimals: 0,
                })
                .withAmount(1n)
            );
          });
        }
      );

      return walletHandles;
    } catch (e) {
      console.log(e);
      return walletHandles;
    }
    // We only want to update the callback if the Handle keys change.
  }, [state.balance]);

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
      setLoadingHandles(() => false);
    });
  }, [memoizedHandleDep, syncHandles, setHandles, setLoadingHandles]);

  return {
    handles,
    loadingHandles,
  };
};
