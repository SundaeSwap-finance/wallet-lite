import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { WalletObserver } from "../../../exports";
import {
  IWalletObserverProviderProps,
  WalletObserverProvider,
} from "../../../exports/react-components";
import { useProviderWalletObserverRef } from "../../../react-components/WalletObserverProvider/hooks/useProviderWalletObserverRef";

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
              ...props.observerOptions,
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
