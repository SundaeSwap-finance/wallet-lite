import { beforeEach, describe, expect, it, spyOn, test } from "bun:test";

import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { mockWalletAssetIds } from "../../__data__/assets.js";
import { normalizeAssetIdWithDot } from "../../utils/assets.js";
import { WalletBalanceMap } from "../WalletBalanceMap.class.js";
import { WalletObserver } from "../WalletObserver.class.js";

let instance: WalletBalanceMap;

const fungibleId = "ada.lovelace";
const nftId =
  "06dd6a12db0a3eb41a9fa243dd53df588418d4819f245f36d8c45f49.5265776172645374616b65";

beforeEach(async () => {
  const observer = new WalletObserver({
    metadataResolver: async ({ assetIds, normalizeAssetId }) => {
      const map = new Map<string, IAssetAmountMetadata>();
      for (const id of assetIds) {
        const decimals = id === nftId ? 0 : 6;
        map.set(normalizeAssetId(id), {
          assetId: normalizeAssetId(id),
          decimals,
        });
      }
      return map;
    },
  });
  await observer.connectWallet("eternl");
  const balanceMap = await observer.getBalanceMap();
  if (balanceMap instanceof WalletBalanceMap) {
    instance = balanceMap;
  }
});

describe("WalletBalanceMap", () => {
  it("should instantiate with expected defaults", () => {
    const newInstance = new WalletBalanceMap(new WalletObserver());
    expect(newInstance).toBeInstanceOf(Map);
    expect(newInstance).toBeInstanceOf(WalletBalanceMap);
    expect(newInstance.size).toEqual(0);
  });

  it("should setup the test instance properly", () => {
    expect(instance.size).toEqual(mockWalletAssetIds.length);
    expect([...instance.keys()]).toEqual(
      mockWalletAssetIds.map(normalizeAssetIdWithDot),
    );
  });

  test("getFungibleTokens()", () => {
    const fungible = instance.getFungibleTokens();
    expect(fungible).toBeInstanceOf(Map);
    // It will be one less than the total because we set the decimals for only one of them to 0.
    expect(fungible.size).toEqual(mockWalletAssetIds.length - 1);

    expect(fungible.get(fungibleId)).toBeDefined();
    expect(fungible.get(nftId)).toBeUndefined();
  });

  test("getHandles()", () => {
    const handles = instance.getHandles();
    expect(handles).toBeInstanceOf(Map);
    // No handles exist in the dataset.
    expect(handles.size).toEqual(0);

    expect(handles.get(nftId)).toBeUndefined();
    expect(handles.get(fungibleId)).toBeUndefined();
  });

  test("getNonFungibleTokens()", () => {
    const nfts = instance.getNonFungibleTokens();
    expect(nfts).toBeInstanceOf(Map);
    expect(nfts.size).toEqual(1);

    expect(nfts.get(nftId)).toBeDefined();
    expect(nfts.get(fungibleId)).toBeUndefined();
  });

  test("getNonFungibleTokens(withHandles?: true)", () => {
    const nfts = instance.getNonFungibleTokens(true);
    expect(nfts).toBeInstanceOf(Map);
    expect(nfts.size).toEqual(1);

    expect(nfts.get(nftId)).toBeDefined();
    expect(nfts.get(fungibleId)).toBeUndefined();
  });

  test("getNfts alias", () => {
    const spy = spyOn(instance, "getNonFungibleTokens");
    instance.getNFTs();
    expect(spy).toHaveBeenNthCalledWith(1, undefined);
    instance.getNFTs(true);
    expect(spy).toHaveBeenNthCalledWith(2, true);
  });
});
