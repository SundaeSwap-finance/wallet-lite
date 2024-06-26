import { KoraLabsProvider } from "@koralabs/adahandle-sdk";
import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, spyOn } from "bun:test";

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
      {state.ready?.toString()}
      {state.unusedAddresses.toString()}
      {state.usedAddresses.toString()}
      {[...state.handles.values()].map(({ metadata }) => (
        <p key={metadata.assetId} data-testid={metadata.name}>
          {JSON.stringify(metadata)}
        </p>
      ))}
      <button
        data-testid="connect-with-handles"
        onClick={() => state.observer.connectWallet("eternl")}
      ></button>
    </pre>
  );
};

describe("RenderWalletHandles", () => {
  it("should successfully update state with handle metadata", async () => {
    const user = userEvent.setup();
    const spiedOnGetAllDataBatch = spyOn(
      KoraLabsProvider.prototype,
      "getAllDataBatch"
    );
    spiedOnGetAllDataBatch.mockImplementationOnce(
      // @ts-ignore Bug in Bun.sh that mocks the function result rather than the reference.
      () => async () => mockHandleMetadata
    );
    spiedOnGetAllDataBatch.mockImplementationOnce(
      // @ts-ignore Bug in Bun.sh that mocks the function result rather than the reference.
      () => async () => mockHandleMetadata
    );

    // Necessary because we are mocking transitions and this will return false.
    // const spiedOnUseDerivedState = spyOn(derivedStateHook, "useDerivedState");
    // spiedOnUseDerivedState.mockImplementation(() => ({
    //   mainAddress: "0c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d00",
    //   stakeAddress: "",
    // }));

    const { container, getByTestId, queryByTestId, rerender } = render(
      <RenderWalletHandles render={TestComponent} />,
      {
        wrapper(props) {
          return <WalletObserverProvider {...props} />;
        },
      }
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

    spiedOnGetAllDataBatch.mockImplementationOnce(
      // @ts-ignore See first mock comment.
      () => async () => mockHandleMetadata.map(({ name }) => `${name}-updated`)
    );

    rerender(<RenderWalletHandles render={TestComponent} />);

    expect(container.innerHTML).toMatchSnapshot();
    // expect(queryByTestId("calvin")).toBeNull();
    // expect(queryByTestId("pi")).toBeUndefined();
    // expect(queryByTestId("calvin-updated")).not.toBeUndefined();
    // expect(queryByTestId("pi-updated")).not.toBeUndefined();
  });
});
