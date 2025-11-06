import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";
import { FC, PropsWithChildren } from "react";

import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import {
  IWalletObserverProviderProps,
  WalletObserverProvider,
} from "../../../index.js";
import { useProviderWalletObserverRef } from "../../WalletObserverProvider/hooks/useProviderWalletObserverRef.js";

const client = new QueryClient();
const QueryProvider: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useWalletObserverRef", () => {
  it("should correctly retrieve the instance", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useProviderWalletObserverRef>
    >(() => useProviderWalletObserverRef(), {
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

    expect(result.current.observerRef.current).toBeInstanceOf(WalletObserver);
  });
});
