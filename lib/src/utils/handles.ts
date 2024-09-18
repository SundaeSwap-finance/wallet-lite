import { IHandle } from "@koralabs/adahandle-sdk";
import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { WalletAssetMap } from "../classes/WalletAssetMap.class.js";
import { THandleMetadata } from "../react-components/contexts/observer/types.js";
import { normalizeAssetIdWithDot } from "./assets.js";
import { getHandleLib } from "./getLibs.js";

export const getHandleMetadata = async <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>(
  balance: WalletAssetMap<AssetMetadata>,
  network: number,
): Promise<WalletAssetMap<THandleMetadata<AssetMetadata>>> => {
  const currentWalletHandles = new WalletAssetMap<AssetMetadata>(balance);
  const newCurrentWalletHandles = new WalletAssetMap<
    THandleMetadata<AssetMetadata>
  >();

  // Abort early if no handles.
  if (currentWalletHandles.size === 0) {
    return newCurrentWalletHandles;
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

      newCurrentWalletHandles.set(
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

    return newCurrentWalletHandles;
  } catch (e) {
    console.error(e);
  }

  return newCurrentWalletHandles;
};
