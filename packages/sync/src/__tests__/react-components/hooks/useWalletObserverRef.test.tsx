import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { WalletObserver } from "../../../classes/WalletObserver.class.js";
import {
  IWalletObserverProviderProps,
  WalletObserverProvider,
} from "../../../index.js";
import { useProviderWalletObserverRef } from "../../../react-components/WalletObserverProvider/hooks/useProviderWalletObserverRef.js";

describe("useWalletObserverRef", () => {
  it("should correctly retrieve the instance", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useProviderWalletObserverRef>
    >(() => useProviderWalletObserverRef(), {
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

    expect(result.current.current).toBeInstanceOf(WalletObserver);
  });
});
