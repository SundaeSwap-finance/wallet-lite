// import { Cip30Wallet } from "@cardano-sdk/dapp-connector";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";
import { mockedEternlWallet } from "../../../../../setup-tests.js";
import {
  IWalletObserverProviderProps,
  useAvailableExtensions,
  WalletObserverProvider,
} from "../../../index.js";

const INTERVAL_AMOUNT = 10;

const client = new QueryClient();
const QueryProvider: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useAvailableExtensions", () => {
  it("should correctly retrieve the instance", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useAvailableExtensions>
    >(() => useAvailableExtensions(INTERVAL_AMOUNT), {
      wrapper: (props) => (
        <QueryProvider>
          <WalletObserverProvider {...props} />
        </QueryProvider>
      ),
    });

    act(() => {
      expect(result.current).toEqual([
        { name: "Eternl", property: "eternl", reference: mockedEternlWallet },
      ]);
    });

    await act(async () => {
      // Inject a duplicate api.
      window.cardano = {
        ...window.cardano,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        flint: mockedEternlWallet as unknown as any,
      };

      // Wait 10 milliseconds for interval to catch.
      await new Promise((res) => setTimeout(res, INTERVAL_AMOUNT));
    });

    expect(result.current).toEqual([
      {
        name: "Eternl",
        property: "eternl",
        reference: mockedEternlWallet,
      },
      {
        name: "Eternl",
        property: "flint",
        reference: mockedEternlWallet,
      },
    ]);
  });

  it("should exclude extensions whose property reads throw, without crashing", async () => {
    const hostile = new Proxy({} as never, {
      get() {
        throw new TypeError(
          "'get' on proxy: property 'prototype' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value",
        );
      },
    });

    window.cardano = {
      eternl: mockedEternlWallet,
      hostile,
    };

    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useAvailableExtensions>
    >(() => useAvailableExtensions(INTERVAL_AMOUNT), {
      wrapper: (props) => (
        <QueryProvider>
          <WalletObserverProvider {...props} />
        </QueryProvider>
      ),
    });

    await act(async () => {
      await new Promise((res) => setTimeout(res, INTERVAL_AMOUNT * 2));
    });

    expect(result.current).toEqual([
      { name: "Eternl", property: "eternl", reference: mockedEternlWallet },
    ]);
  });

  it("should not deep-compare injected extensions between polls", async () => {
    // Mimics wallets injected as invariant-violating Proxies: identity reads
    // (apiVersion, name) answer with stable strings, but any other read lies
    // about the underlying class — so reading a read-only, non-configurable
    // property such as `prototype` makes the engine throw a TypeError. A
    // fresh proxy is returned on every access, so any deep comparison of the
    // namespace walks into it and crashes.
    class ProxiedApi {}
    const makeInvariantViolatingWallet = () =>
      new Proxy(ProxiedApi, {
        get(target, prop) {
          if (prop === "apiVersion") return "1.0";
          if (prop === "name") return "sneaky";
          return {};
        },
      });

    // Sanity: this is the exact failure users hit when such a wallet is
    // deep-inspected.
    expect(
      () =>
        (makeInvariantViolatingWallet() as { prototype?: unknown }).prototype,
    ).toThrow(TypeError);

    const namespace = { eternl: mockedEternlWallet };
    Object.defineProperty(namespace, "sneaky", {
      configurable: true,
      enumerable: true,
      get: () => makeInvariantViolatingWallet(),
    });
    window.cardano = namespace;

    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useAvailableExtensions>
    >(() => useAvailableExtensions(INTERVAL_AMOUNT), {
      wrapper: (props) => (
        <QueryProvider>
          <WalletObserverProvider {...props} />
        </QueryProvider>
      ),
    });

    const initialList = result.current;
    expect(
      initialList.map((e) => ({ name: e.name, property: e.property })),
    ).toEqual([
      { name: "Eternl", property: "eternl" },
      { name: "Sneaky", property: "sneaky" },
    ]);

    await act(async () => {
      await new Promise((res) => setTimeout(res, INTERVAL_AMOUNT * 3));
    });

    // The fingerprint is unchanged, so the list must be the same reference:
    // no crash, and no re-render churn from fresh proxy identities.
    expect(result.current).toBe(initialList);
  });
});
