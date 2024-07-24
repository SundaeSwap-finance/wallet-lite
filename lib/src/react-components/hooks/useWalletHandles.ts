import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { IHandle } from "@koralabs/adahandle-sdk";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { TAssetAmountMap } from "../../@types/observer.js";
import { WalletAssetMap } from "../../classes/WalletAssetMap.class.js";
import { normalizeAssetIdWithDot } from "../../utils/assets.js";
import { THandleMetadata } from "../contexts/observer/types.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletHandles = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>() => {
  const state = useWalletObserver<THandleMetadata<AssetMetadata>>();
  const [handles, setHandles] = useState<
    TAssetAmountMap<THandleMetadata<AssetMetadata>>
  >(state.handles);
  const [isLoading, setIsLoading] = useState(true);
  const deferredHandles = useDeferredValue(handles);

  const memoizedHandleDep = useMemo(
    () => [...state.balance.getHandles().keys()],
    [state.balance],
  );

  const syncHandles = useCallback<
    () => Promise<TAssetAmountMap<THandleMetadata<AssetMetadata>>>
  >(async () => {
    const walletHandles: TAssetAmountMap<THandleMetadata<AssetMetadata>> =
      new WalletAssetMap<THandleMetadata<AssetMetadata>>([
        ...state.balance.getHandles(),
      ]);

    if (walletHandles.size === 0) {
      return walletHandles;
    }

    try {
      setIsLoading(true);
      const {
        default: HandleClient,
        HandleClientContext,
        KoraLabsProvider,
      } = await import("@koralabs/adahandle-sdk");

      const context =
        state.network === 1
          ? HandleClientContext.MAINNET
          : HandleClientContext.PREVIEW;

      const sdk = new HandleClient({
        context,
        provider: new KoraLabsProvider(context),
      });

      const walletHandlesWithDataArray = [...walletHandles.entries()];
      const walletHandleDataArray: IHandle[] = await sdk
        .provider()
        .getAllDataBatch(
          walletHandlesWithDataArray.map(([key]) => ({
            value: key.split(".")[1],
          })),
        );

      walletHandlesWithDataArray.forEach(([key, asset]) => {
        const matchingData = walletHandleDataArray.find(
          ({ hex }) => hex === key.split(".")[1],
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
            .withAmount(1n),
        );
      });

      return walletHandles;
    } catch (e) {
      console.error(e);
      return walletHandles;
    }
  }, [state.balance, state.network]);

  useEffect(() => {
    const fetchHandles = async () => {
      const newHandles = await syncHandles();
      startTransition(() => {
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
        setIsLoading(() => false);
      });
    };

    fetchHandles();
  }, [memoizedHandleDep, syncHandles]);

  return {
    handles: deferredHandles,
    loadingHandles: isLoading,
  };
};
