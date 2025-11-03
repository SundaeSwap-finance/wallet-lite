import { Serialization } from "@cardano-sdk/core";
import { HexBlob } from "@cardano-sdk/util";
import { AssetAmount } from "@sundaeswap/asset";
import { normalizeAssetIdWithDot } from "../utils/assets";
import { mockBalance } from "./eternl";

const assets = Serialization.Value.fromCbor(HexBlob(mockBalance));
const assetsCore = assets.toCore();
export const mockWalletAssetIds: string[] = [];

if (assetsCore.coins > 0n) {
  mockWalletAssetIds.push("ada.lovelace");
}
if (assetsCore.assets) {
  for (const [assetId] of assetsCore.assets) {
    mockWalletAssetIds.push(assetId);
  }
}

export const assetMap = mockWalletAssetIds.map((id) => {
  const assetId = normalizeAssetIdWithDot(id);
  const name = Buffer.from(id.slice(56), "hex").toString("utf-8");

  const nftMetadata = {
    decimals: 0,
    assetId,
    name,
  };

  const fungibleMetadata = {
    ...nftMetadata,
    decimals: 6,
  };

  const isNFT =
    id.includes("8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3") ||
    name.includes("Gutenberg Bible");

  return {
    key: assetId,
    assetAmount: new AssetAmount(
      isNFT ? 1 : Math.floor(Math.random() * 10000000) + 1,
      isNFT ? nftMetadata : fungibleMetadata,
    ),
  };
});
