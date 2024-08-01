import { KoraLabsProvider } from "@koralabs/adahandle-sdk";
import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, spyOn } from "bun:test";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mockHandleMetadata } from "../../__data__/handles.js";
import {
  RenderWalletHandles,
  TRenderWalletHandlesFunctionState,
  WalletObserverProvider,
} from "../../index.js";

const TestComponent = (state: TRenderWalletHandlesFunctionState) => {
  return (
    <pre>
      {state.activeWallet?.toString()}
      {(state.adaBalance.amount > 0n).toString()}
      {state.isCip45?.toString()}
      {state.mainAddress?.toString()}
      {state.network?.toString()}
      {state.unusedAddresses.toString()}
      {state.usedAddresses.toString()}
      {state.handles &&
        [...state.handles.values()].map(({ metadata }) => (
          <p key={metadata.assetId} data-testid={metadata.name}>
            {JSON.stringify(metadata)}
          </p>
        ))}
      <button
        data-testid="connect-with-handles"
        onClick={() => state.connectWallet("eternl")}
      ></button>
    </pre>
  );
};

describe("RenderWalletHandles", () => {
  it("should successfully update state with handle metadata", async () => {
    const user = userEvent.setup();
    const spiedOnGetAllDataBatch = spyOn(
      KoraLabsProvider.prototype,
      "getAllDataBatch",
    );
    spiedOnGetAllDataBatch.mockImplementation(
      // @ts-expect-error Bug in Bun.sh that mocks the function result rather than the reference.
      () => async () => mockHandleMetadata,
    );

    const { container, getByTestId, queryByTestId, rerender } = render(
      <RenderWalletHandles render={TestComponent} />,
      {
        wrapper(props) {
          return (
            <QueryClientProvider client={new QueryClient()}>
              <WalletObserverProvider {...props} />
            </QueryClientProvider>
          );
        },
      },
    );

    expect(spiedOnGetAllDataBatch).not.toHaveBeenCalled();
    expect(queryByTestId("calvin")).toBeNull();
    expect(queryByTestId("pi")).toBeNull();
    expect(container.innerHTML).toMatchSnapshot();

    const button = getByTestId("connect-with-handles");
    await user.click(button);
    expect(spiedOnGetAllDataBatch).toHaveBeenCalled();

    rerender(<RenderWalletHandles render={TestComponent} />);
    expect(queryByTestId("calvin")).not.toBeNull();
    expect(queryByTestId("pi")).not.toBeNull();
    expect(container.innerHTML).toMatchSnapshot();
  });
});
