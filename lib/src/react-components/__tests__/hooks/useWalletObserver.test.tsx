import { Cardano } from "@cardano-sdk/core";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-hooks";
import { describe, expect, it, jest } from "bun:test";
import { FC, PropsWithChildren } from "react";

import { mockWalletAssetIds } from "../../../__data__/assets.js";
import {
  mockNetwork,
  mockUnusedAddresses,
  mockUsedAddresses,
} from "../../../__data__/eternl.js";
import { TMetadataResolverFunc } from "../../../@types/observer.js";
import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import { normalizeAssetIdWithDot } from "../../../utils/assets.js";
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

  it("should expose resyncMetadata and refetch metadata when called", async () => {
    const resolverA: TMetadataResolverFunc<IAssetAmountMetadata> = jest
      .fn<TMetadataResolverFunc<IAssetAmountMetadata>>()
      .mockImplementation(async ({ assetIds }) => {
        const map = new Map<string, IAssetAmountMetadata>();
        assetIds.forEach((id) =>
          map.set(normalizeAssetIdWithDot(id), {
            assetId: normalizeAssetIdWithDot(id),
            decimals: 6,
          }),
        );
        return map;
      });

    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useWalletObserver>
    >(() => useWalletObserver(), {
      wrapper: (props) => (
        <QueryProvider>
          <WalletObserverProvider
            {...{
              ...props,
              options: {
                observerOptions: {
                  connectTimeout: 10,
                  metadataResolver: resolverA,
                },
              },
            }}
          />
        </QueryProvider>
      ),
    });

    expect(result.current.resyncMetadata).toBeInstanceOf(Function);

    await act(async () => {
      await result.current.observer.connectWallet("eternl");
      await result.current.syncWallet();
    });

    const callCountAfterSync = (resolverA as ReturnType<typeof jest.fn>).mock
      .calls.length;
    expect(callCountAfterSync).toBeGreaterThan(0);

    // Call resyncMetadata — should trigger a fresh metadata fetch
    await act(async () => {
      await result.current.resyncMetadata();
    });

    const callCountAfterResync = (resolverA as ReturnType<typeof jest.fn>).mock
      .calls.length;
    expect(callCountAfterResync).toBeGreaterThan(callCountAfterSync);
    // Balance should still be populated after resync
    expect(result.current.balance.size).toEqual(mockWalletAssetIds.length);
  });

  it("should abort in-flight metadata fetch and re-sync when metadataResolver changes", async () => {
    const resolverA: TMetadataResolverFunc<IAssetAmountMetadata> = jest
      .fn<TMetadataResolverFunc<IAssetAmountMetadata>>()
      .mockImplementation(async ({ assetIds }) => {
        const map = new Map<string, IAssetAmountMetadata>();
        assetIds.forEach((id) =>
          map.set(normalizeAssetIdWithDot(id), {
            assetId: normalizeAssetIdWithDot(id),
            decimals: 6,
          }),
        );
        return map;
      });

    const resolverB: TMetadataResolverFunc<IAssetAmountMetadata> = jest
      .fn<TMetadataResolverFunc<IAssetAmountMetadata>>()
      .mockImplementation(async ({ assetIds }) => {
        const map = new Map<string, IAssetAmountMetadata>();
        assetIds.forEach((id) =>
          map.set(normalizeAssetIdWithDot(id), {
            assetId: normalizeAssetIdWithDot(id),
            decimals: 0,
          }),
        );
        return map;
      });

    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useWalletObserver>
    >(() => useWalletObserver(), {
      wrapper: (props) => (
        <QueryProvider>
          <WalletObserverProvider
            {...{
              ...props,
              options: {
                observerOptions: {
                  connectTimeout: 10,
                  metadataResolver: resolverA,
                },
              },
            }}
          />
        </QueryProvider>
      ),
    });

    await act(async () => {
      await result.current.observer.connectWallet("eternl");
      await result.current.syncWallet();
    });

    expect(result.current.balance.size).toEqual(mockWalletAssetIds.length);

    // Swap metadataResolver via updateOptions — should abort + clear cache + re-sync
    await act(async () => {
      result.current.observer.updateOptions({
        metadataResolver: resolverB,
      });
      // Wait for the re-sync triggered by updateOptions
      await new Promise((r) => setTimeout(r, 100));
      await result.current.syncWallet();
    });

    expect(
      (resolverB as ReturnType<typeof jest.fn>).mock.calls.length,
    ).toBeGreaterThan(0);
    expect(result.current.balance.size).toEqual(mockWalletAssetIds.length);

    // Verify the new metadata (decimals: 0) is applied
    for (const [, asset] of result.current.balance) {
      expect(asset.metadata?.decimals).toEqual(0);
    }
  });
});
