// import { Cip30Wallet } from "@cardano-sdk/dapp-connector";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { mockedEternlWallet } from "../../../../../setup-tests.js";
import {
  IWalletObserverProviderProps,
  useAvailableExtensions,
  WalletObserverProvider,
} from "../../../index.js";

const INTERVAL_AMOUNT = 10;

describe("useAvailableExtensions", () => {
  it("should correctly retrieve the instance", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useAvailableExtensions>
    >(() => useAvailableExtensions(INTERVAL_AMOUNT), {
      wrapper: (props) => <WalletObserverProvider {...props} />,
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
});
