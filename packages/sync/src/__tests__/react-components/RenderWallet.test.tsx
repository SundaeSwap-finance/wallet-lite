import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "bun:test";

import {
  RenderWallet,
  TUseWalletObserverState,
  WalletObserverProvider,
} from "../../exports/react-components";

const TestComponent = (state: TUseWalletObserverState) => {
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
      <button
        data-testid="connect"
        onClick={() => state.observer.connectWallet("eternl")}
      ></button>
    </pre>
  );
};

describe("RenderWallet", () => {
  it("should call useWalletObserver", async () => {
    const user = userEvent.setup();

    const { container, getByTestId, rerender } = render(
      <RenderWallet render={TestComponent} />,
      {
        wrapper(props) {
          return <WalletObserverProvider {...props} />;
        },
      }
    );

    expect(container.innerHTML).toMatchSnapshot();

    const button = getByTestId("connect");
    await user.click(button);

    rerender(<RenderWallet render={TestComponent} />);

    expect(container.innerHTML).toMatchSnapshot();
  });
});
