import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import {
  IWalletObserverProviderProps,
  WalletObserverProvider,
  useWalletObserver,
} from "../../../index.js";
import { assetIds } from "../../__data__/assets.js";
import {
  network,
  unusedAddresses,
  usedAddresses,
} from "../../__data__/eternl.js";

describe("useWalletObserver", () => {
  it("should correctly retrieve the context", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useWalletObserver>
    >(() => useWalletObserver(), {
      wrapper: (props) => (
        <WalletObserverProvider
          {...{
            ...props,
            observerOptions: {
              ...props.options?.observerOptions,
              // Quick resolve time for tests.
              connectTimeout: 10,
            },
          }}
        />
      ),
    });

    expect(result.current.activeWallet).toBeUndefined();
    expect(result.current.adaBalance.amount.toString()).toEqual("0");
    expect(result.current.balance.size).toEqual(0);
    expect(result.current.isCip45).toBeFalse();
    expect(result.current.mainAddress).toBeUndefined();
    expect(result.current.network).toBeUndefined();
    expect(result.current.observer).toBeInstanceOf(WalletObserver);
    expect(result.current.ready).toBeFalse();
    expect(result.current.syncWallet).toBeInstanceOf(Function);
    expect(result.current.unusedAddresses).toEqual([]);
    expect(result.current.usedAddresses).toEqual([]);

    await act(async () => {
      await result.current.observer.connectWallet("eternl");
      await result.current.syncWallet();
    });

    expect(result.current.activeWallet).toEqual("eternl");
    expect(result.current.adaBalance.amount.toString()).not.toEqual("0");
    expect(result.current.balance.size).toEqual(assetIds.length);
    expect(result.current.isCip45).toBeFalse();
    expect(result.current.mainAddress).toEqual(usedAddresses[0]);
    expect(result.current.network).toEqual(network);
    expect(result.current.ready).toBeTrue();
    expect(result.current.unusedAddresses).toEqual(unusedAddresses);
    expect(result.current.usedAddresses).toEqual(usedAddresses);
  });
});
