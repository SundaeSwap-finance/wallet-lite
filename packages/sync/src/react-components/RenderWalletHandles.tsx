import HandleClient, {
  HandleClientContext,
  KoraLabsProvider,
} from "@koralabs/adahandle-sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { TAssetAmountMap } from "../@types/observer";
import { THandleMetadata } from "./contexts/observer";
import { useWalletObserver } from "./hooks/useWalletObserver";

export type IWalletHandles<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> = {
  handles: TAssetAmountMap<THandleMetadata<AssetMetadata>>;
  loadingHandles: boolean;
};

export type TRenderWalletHandlesFunctionState<
  T extends IAssetAmountMetadata = IAssetAmountMetadata
> = ReturnType<typeof useWalletObserver<T>> & IWalletHandles;

export type TRenderWalletHandlesFunction = (
  state: TRenderWalletHandlesFunctionState
) => JSX.Element | ReactNode;

export interface IRenderWalletHandlesProps {
  render: TRenderWalletHandlesFunction;
}

/**
 * This component is the same as RenderWallet, but supports
 * fetching and updating wallet Handles with their extra
 * metadata.
 */
export const RenderWalletHandles: FC<IRenderWalletHandlesProps> = ({
  render,
}) => {
  const state = useWalletObserver<THandleMetadata>();
  const [loadingHandles, setLoadingHandles] = useState(true);
  const [handles, setHandles] = useState<TAssetAmountMap<THandleMetadata>>(
    new Map()
  );

  const syncHandles = useCallback<
    () => Promise<TAssetAmountMap<THandleMetadata>>
  >(async () => {
    const context =
      state.network === 1
        ? HandleClientContext.MAINNET
        : HandleClientContext.PREVIEW;

    // @ts-ignore Type isn't exported from default.
    const sdk = new HandleClient({
      context,
      provider: new KoraLabsProvider(context),
    });

    const handles: TAssetAmountMap<THandleMetadata> =
      state.balance.getHandles();

    if (handles.size === 0) {
      return handles;
    }

    // Restore once SDK updated
    const assetNames = [...handles.keys()];
    const data = await sdk
      .provider()
      .getAllDataBatch(assetNames.map((n) => ({ value: n.slice(56) })));

    assetNames.forEach((n) => {
      const matchingAsset = state.balance.get(n);
      if (!matchingAsset) {
        return;
      }
      handles.set(
        matchingAsset.metadata.assetId,
        new AssetAmount(1n, {
          ...data,
          ...matchingAsset.metadata,
          decimals: 0,
        })
      );
    });

    return handles;
  }, [state.balance]);

  useEffect(() => {
    if (!state.balance.size) {
      return;
    }

    setLoadingHandles(true);
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

      setLoadingHandles(false);
    });
  }, [state.balance, syncHandles, setLoadingHandles, setHandles]);

  return (
    <>
      {render({
        ...state,
        handles,
        loadingHandles,
      })}
    </>
  );
};
