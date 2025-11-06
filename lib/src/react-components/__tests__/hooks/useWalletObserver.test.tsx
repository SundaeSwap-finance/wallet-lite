import { Cardano } from "@cardano-sdk/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";
import { FC, PropsWithChildren } from "react";

import { mockWalletAssetIds } from "../../../__data__/assets.js";
import {
  mockNetwork,
  mockUnusedAddresses,
  mockUsedAddresses,
} from "../../../__data__/eternl.js";
import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import {
  IWalletObserverProviderProps,
  WalletObserverProvider,
  useWalletObserver,
} from "../../../index.js";

const client = new QueryClient();
const QueryProvider: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useWalletObserver", () => {
  it("should correctly retrieve the context", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useWalletObserver>
    >(() => useWalletObserver(), {
      wrapper: (props) => (
        <QueryProvider>
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
        </QueryProvider>
      ),
    });

    expect(result.current.activeWallet).toBeUndefined();
    expect(result.current.adaBalance.amount.toString()).toEqual("0");
    expect(result.current.balance.size).toEqual(0);
    expect(result.current.isCip45).toBeFalse();
    expect(result.current.mainAddress).toBeUndefined();
    expect(result.current.network).toBeUndefined();
    expect(result.current.observer).toBeInstanceOf(WalletObserver);
    expect(result.current.syncWallet).toBeInstanceOf(Function);
    expect(result.current.unusedAddresses).toEqual([]);
    expect(result.current.usedAddresses).toEqual([]);

    await act(async () => {
      await result.current.observer.connectWallet("eternl");
      await result.current.syncWallet();
    });

    expect(result.current.activeWallet).toEqual("eternl");
    expect(result.current.adaBalance.amount.toString()).not.toEqual("0");
    expect(result.current.balance.size).toEqual(mockWalletAssetIds.length);
    expect(result.current.isCip45).toBeFalse();
    expect(result.current.mainAddress).toEqual(
      Cardano.Address.fromString(mockUsedAddresses[0])!.toBech32(),
    );
    expect(result.current.network).toEqual(mockNetwork);
    expect(result.current.unusedAddresses).toEqual(
      mockUnusedAddresses.map((cbor) =>
        Cardano.Address.fromString(cbor)!.toBech32(),
      ),
    );
    expect(result.current.usedAddresses).toEqual(
      mockUsedAddresses.map((cbor) =>
        Cardano.Address.fromString(cbor)!.toBech32(),
      ),
    );
  });
});
