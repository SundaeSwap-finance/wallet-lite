import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { IHandle } from "@koralabs/adahandle-sdk";
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
    const handles: TAssetAmountMap<THandleMetadata> =
      state.balance.getHandles();

    if (handles.size === 0) {
      return handles;
    }

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
    const walletHandles = [...handles.entries()];
    const walletHandleDataArray: IHandle[] = await sdk
      .provider()
      .getAllDataBatch(
        walletHandles.map(([key]) => ({ value: key.slice(56) }))
      );

    walletHandles.forEach(([key, asset]) => {
      const matchingData = walletHandleDataArray.find(
        ({ hex }) => hex === key.slice(56)
      ) as IHandle;

      handles.set(
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

    return handles;
  }, [state.balance]);

  useEffect(() => {
    setLoadingHandles(true);
    syncHandles().then((newHandles) => {
      setHandles((prevHandles) => {
        console.log(
          prevHandles.get(
            "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d696e696d616c"
          ),
          newHandles.get(
            "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d696e696d616c"
          )
        );
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
  }, [syncHandles, setLoadingHandles, setHandles]);

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
