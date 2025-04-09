import { AssetAmount } from "@sundaeswap/asset";
import { beforeEach, describe, expect, it } from "bun:test";

import { ADA_ASSET_ID } from "../../constants";
import { WalletAssetMap } from "../WalletAssetMap.class";

let am: WalletAssetMap;

const ADA_ASSET_IDS = [
  "",
  ".",
  "ada.lovelace",
  "cardano.ada",
  "616461.6c6f76656c616365",
];

beforeEach(() => {
  am = new WalletAssetMap();
});

describe("WalletAssetMap", () => {
  describe("set()", () => {
    it("should conform the map key to dot notation", () => {
      expect(am.size).toEqual(0);

      am.set(
        "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15524245525259",
        new AssetAmount(100n, {
          assetId:
            "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
          decimals: 0,
        }),
      );

      expect(am.size).toEqual(1);
    });

    it("should conform the asset metadata to dot notation", () => {
      expect(am.size).toEqual(0);

      am.set(
        "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
        new AssetAmount(100n, {
          assetId:
            "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15524245525259",
          decimals: 0,
        }),
      );

      expect(
        am.get(
          "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
        )?.metadata.assetId,
      ).toEqual(
        "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
      );
    });

    it("should normalize the key if using an ada assetId", () => {
      ADA_ASSET_IDS.forEach((id) => {
        expect(am.size).toEqual(0);

        am.set(
          id,
          new AssetAmount(100n, {
            assetId: id,
            decimals: 0,
          }),
        );

        expect(am.size).toEqual(1);
        expect(am.get(ADA_ASSET_ID)).not.toBeUndefined();
        expect(am.get(ADA_ASSET_ID)?.metadata.assetId).toEqual(ADA_ASSET_ID);
        const deleted = am.delete(ADA_ASSET_ID);
        expect(deleted).toBeTrue();
      });
    });
  });

  describe("get()", () => {
    it("should normalize the key to dot notation", () => {
      expect(am.size).toEqual(0);

      am.set(
        "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
        new AssetAmount(100n, {
          assetId:
            "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
          decimals: 0,
        }),
      );

      expect(am.size).toEqual(1);

      expect(
        am.get(
          "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15524245525259",
        ),
      ).not.toBeUndefined();
    });

    it("should normalize the key if using an ada assetId", () => {
      ADA_ASSET_IDS.forEach((id) => {
        expect(am.size).toEqual(0);

        am.set(
          "ada.lovelace",
          new AssetAmount(100n, {
            assetId: "ada.lovelace",
            decimals: 0,
          }),
        );

        expect(am.size).toEqual(1);
        expect(am.get(id)).not.toBeUndefined();
        expect(am.get(id)?.metadata.assetId).toEqual(ADA_ASSET_ID);
        const deleted = am.delete(id);
        expect(deleted).toBeTrue();
      });
    });
  });

  describe("has()", () => {
    it("should normalize the key to dot notation", () => {
      expect(am.size).toEqual(0);

      am.set(
        "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
        new AssetAmount(100n, {
          assetId:
            "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
          decimals: 0,
        }),
      );

      expect(am.size).toEqual(1);

      expect(
        am.has(
          "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15524245525259",
        ),
      ).toBeTrue();
    });

    it("should normalize the key if using an ada assetId", () => {
      ADA_ASSET_IDS.forEach((id) => {
        expect(am.size).toEqual(0);

        am.set(
          "ada.lovelace",
          new AssetAmount(100n, {
            assetId: "ada.lovelace",
            decimals: 0,
          }),
        );

        expect(am.size).toEqual(1);
        expect(am.has(id)).toBeTrue();
        am.delete(id);
      });
    });
  });
});
