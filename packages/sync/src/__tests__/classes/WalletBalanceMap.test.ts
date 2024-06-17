import { beforeEach, describe, expect, it, spyOn, test } from "bun:test";

import { WalletBalanceMap } from "../../classes/WalletBalanceMap.class.js";
import { WalletObserver } from "../../classes/WalletObserver.class.js";
import { assetIds, assetMap } from "../__data__/assets.js";

let instance: WalletBalanceMap;

const fungibleId = "ada.lovelace";
const handleId =
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d696e696d616c";
const nftId =
  "477cec772adb1466b301fb8161f505aa66ed1ee8d69d3e7984256a43477574656e62657267204269626c65202336393232";

beforeEach(() => {
  const observer = new WalletObserver();
  instance = new WalletBalanceMap(observer);
  assetMap.forEach(({ key, assetAmount }) => {
    instance.set(key, assetAmount);
  });
});

describe("WalletBalanceMap", () => {
  it("should instantiate with expected defaults", () => {
    const newInstance = new WalletBalanceMap(new WalletObserver());
    expect(newInstance).toBeInstanceOf(Map);
    expect(newInstance).toBeInstanceOf(WalletBalanceMap);
    expect(newInstance.size).toEqual(0);
  });

  it("should setup the test instance properly", () => {
    expect(instance.size).toEqual(103);
    expect([...instance.keys()]).toEqual(assetIds);
  });

  test("getFungibleTokens()", () => {
    const fungible = instance.getFungibleTokens();
    expect(fungible).toBeInstanceOf(Map);
    expect(fungible.size).toEqual(55);

    expect(fungible.get(fungibleId)).toBeDefined();
    expect(fungible.get(handleId)).toBeUndefined();
    expect(fungible.get(nftId)).toBeUndefined();
  });

  test("getHandles()", () => {
    const handles = instance.getHandles();
    expect(handles).toBeInstanceOf(Map);
    expect(handles.size).toEqual(45);

    expect(handles.get(handleId)).toBeDefined();
    expect(handles.get(nftId)).toBeUndefined();
    expect(handles.get(fungibleId)).toBeUndefined();
  });

  test("getNonFungibleTokens()", () => {
    const nfts = instance.getNonFungibleTokens();
    expect(nfts).toBeInstanceOf(Map);
    expect(nfts.size).toEqual(3);

    expect(nfts.get(nftId)).toBeDefined();
    expect(nfts.get(handleId)).toBeUndefined();
    expect(nfts.get(fungibleId)).toBeUndefined();
  });

  test("getNonFungibleTokens(withHandles?: true)", () => {
    const nfts = instance.getNonFungibleTokens(true);
    expect(nfts).toBeInstanceOf(Map);
    expect(nfts.size).toEqual(48);

    expect(nfts.get(nftId)).toBeDefined();
    expect(nfts.get(handleId)).toBeDefined();
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
