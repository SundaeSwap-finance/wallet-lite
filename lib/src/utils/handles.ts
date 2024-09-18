import { IHandle } from "@koralabs/adahandle-sdk";
import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { TAssetAmountMap } from "../@types/observer.js";
import { WalletAssetMap } from "../classes/WalletAssetMap.class.js";
import { THandleMetadata } from "../react-components/contexts/observer/types.js";
import { normalizeAssetIdWithDot } from "./assets.js";
import { getHandleLib } from "./getLibs.js";

export const getHandleMetadata = async <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(
  balance: TAssetAmountMap<THandleMetadata<AssetMetadata>>,
  network: number,
) => {
  const currentWalletHandles: TAssetAmountMap<THandleMetadata<AssetMetadata>> =
    new WalletAssetMap<THandleMetadata<AssetMetadata>>(balance);

  // Abort early if no handles.
  if (currentWalletHandles.size === 0) {
    return currentWalletHandles;
  }

  try {
    const { HandleClient, HandleClientContext, KoraLabsProvider } =
      await getHandleLib();

    const context =
      network === 1 ? HandleClientContext.MAINNET : HandleClientContext.PREVIEW;

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
};
