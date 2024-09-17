import type { IHandle } from "@koralabs/adahandle-sdk";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { TAssetAmountMap } from "../../@types/observer.js";
import { WalletAssetMap } from "../../classes/WalletAssetMap.class.js";
import { normalizeAssetIdWithDot } from "../../utils/assets.js";
import { getHandleLib } from "../../utils/getLibs.js";
import { THandleMetadata } from "../contexts/observer/types.js";
import { useWalletObserver } from "./useWalletObserver.js";

export const useWalletHandles = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>() => {
  const queryClient = useQueryClient();
  const state = useWalletObserver<THandleMetadata<AssetMetadata>>();
  const memoizedHandleDep = useMemo(
    () => [...state.balance.getHandles().keys()],
    [state.balance],
  );

  const queryKey = [memoizedHandleDep, state.mainAddress];
  const { data: handles, isLoading } = useQuery<
    TAssetAmountMap<THandleMetadata<AssetMetadata>> | undefined
  >({
    queryKey,
    queryFn: async () => {
      const currentWalletHandles: TAssetAmountMap<
        THandleMetadata<AssetMetadata>
      > = new WalletAssetMap<THandleMetadata<AssetMetadata>>([
        ...state.balance.getHandles(),
      ]);

      // Abort early if no handles.
      if (currentWalletHandles.size === 0) {
        return currentWalletHandles;
      }

      const cachedMetadata =
        queryClient.getQueryData<
          TAssetAmountMap<THandleMetadata<AssetMetadata>>
        >(queryKey);

      let updateMetadata = false;
      if (cachedMetadata) {
        for (const [, val] of cachedMetadata) {
          if (!val?.metadata?.rarity) {
            updateMetadata = true;
            break;
          }
        }
      }

      if (!updateMetadata && cachedMetadata) {
        return cachedMetadata;
      }

      try {
        const { HandleClient, HandleClientContext, KoraLabsProvider } =
          await getHandleLib();

        const context =
          state.network === 1
            ? HandleClientContext.MAINNET
            : HandleClientContext.PREVIEW;

        const sdk = new HandleClient({
          context,
          provider: new KoraLabsProvider(context),
        });

        const walletHandlesWithDataArray = [...currentWalletHandles.entries()];
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

          currentWalletHandles.set(
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

        return currentWalletHandles;
      } catch (e) {
        console.error(e);
      }

      return currentWalletHandles;
    },
    refetchInterval: false,
    notifyOnChangeProps: ["data", "isLoading"],
  });

  const memoizedResult = useMemo(
    () => ({
      handles,
      loadingHandles: isLoading,
      totalCount: memoizedHandleDep.length,
    }),
    [handles, isLoading, memoizedHandleDep],
  );

  return memoizedResult;
};
