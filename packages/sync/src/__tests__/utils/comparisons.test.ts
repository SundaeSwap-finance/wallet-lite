import { describe, expect, it } from "bun:test";

import { AssetAmount } from "@sundaeswap/asset";
import { WalletBalanceMap } from "../../classes/WalletBalanceMap.class";
import { WalletObserver } from "../../classes/WalletObserver.class";
import { areAssetMapsEqual } from "../../utils/comparisons";

describe("comparisons", () => {
  describe("areAssetMapsEqual", () => {
    const observer = new WalletObserver();

    it("should accurately test instance equality", () => {
      expect(areAssetMapsEqual(new Map(), new Map())).toBeTrue();
      expect(
        areAssetMapsEqual(new Map(), new WalletBalanceMap(observer))
      ).toBeTrue();
      expect(
        areAssetMapsEqual(
          new WalletBalanceMap(observer),
          new WalletBalanceMap(new WalletObserver())
        )
      ).toBeTrue();
    });

    it("should accurately test true statements", () => {
      const map1 = new Map();
      const map2 = new Map();
      const balanceMap1 = new WalletBalanceMap(observer);
      const balanceMap2 = new WalletBalanceMap(observer);

      expect(areAssetMapsEqual(map1, map2)).toBeTrue();
      expect(areAssetMapsEqual(balanceMap1, balanceMap2)).toBeTrue();
      expect(areAssetMapsEqual(map1, balanceMap2)).toBeTrue();
      expect(areAssetMapsEqual(balanceMap1, map2)).toBeTrue();

      map1.set("test", true);
      map2.set("test", true);
      balanceMap1.set("test", new AssetAmount(100n));
      balanceMap2.set("test", new AssetAmount(100n));

      expect(areAssetMapsEqual(map1, map2)).toBeTrue();
      expect(areAssetMapsEqual(balanceMap1, balanceMap2)).toBeTrue();
      expect(areAssetMapsEqual(map1, balanceMap2)).toBeFalse();
      expect(areAssetMapsEqual(balanceMap1, map2)).toBeFalse();
    });

    it("should accurately test false statements", () => {
      const map1 = new Map();
      const map2 = new Map();
      const balanceMap1 = new WalletBalanceMap(observer);
      const balanceMap2 = new WalletBalanceMap(observer);

      expect(areAssetMapsEqual(map1, map2)).toBeTrue();
      expect(areAssetMapsEqual(balanceMap1, balanceMap2)).toBeTrue();
      expect(areAssetMapsEqual(map1, balanceMap2)).toBeTrue();
      expect(areAssetMapsEqual(balanceMap1, map2)).toBeTrue();

      map1.set("test", true);
      map2.set("test", true);
      balanceMap1.set("test", new AssetAmount(100n));
      balanceMap2.set("test", new AssetAmount(100n));

      expect(areAssetMapsEqual(map1, map2)).toBeTrue();
      expect(areAssetMapsEqual(balanceMap1, balanceMap2)).toBeTrue();
      expect(areAssetMapsEqual(map1, balanceMap2)).toBeFalse();
      expect(areAssetMapsEqual(balanceMap1, map2)).toBeFalse();

      map1.set("test", false);
      map2.set("test", true);
      balanceMap1.set("test", new AssetAmount(10n));
      balanceMap2.set("test", new AssetAmount(100n));

      expect(areAssetMapsEqual(map1, map2)).toBeFalse();
      expect(areAssetMapsEqual(balanceMap1, balanceMap2)).toBeFalse();
      expect(areAssetMapsEqual(map1, balanceMap2)).toBeFalse();
      expect(areAssetMapsEqual(balanceMap1, map2)).toBeFalse();

      map1.set("test2", true);
      expect(areAssetMapsEqual(map1, map2)).toBeFalse();

      map1.delete("test");
      expect(areAssetMapsEqual(map1, map2)).toBeFalse();
    });
  });
});
