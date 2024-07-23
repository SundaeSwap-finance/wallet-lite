import { beforeEach, describe, expect, it, mock } from "bun:test";

import { EWalletObserverEvents } from "../../index.js";
import { WalletObserverEvent } from "../WalletObserverEvent.js";

let instance: WalletObserverEvent;

beforeEach(() => {
  instance = new WalletObserverEvent();
});

describe("WalletObserverEvent", () => {
  it("should instantiate with expected defaults", () => {
    expect(instance).toBeInstanceOf(WalletObserverEvent);
    expect(instance.eventList()).toBeInstanceOf(Map);
    expect(instance.eventList().size).toEqual(0);
  });

  it("should properly dispatch registered handlers", () => {
    const handler = mock(() => {});

    expect(instance.eventList().size).toEqual(0);

    instance.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      handler,
    );

    instance.dispatch(EWalletObserverEvents.CONNECT_WALLET_END);

    expect(handler).toHaveBeenCalledTimes(1);

    instance.dispatch(EWalletObserverEvents.CONNECT_WALLET_END);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("should properly add handlers", () => {
    const handler = () => {
      console.log("test");
    };
    expect(instance.eventList().size).toEqual(0);

    instance.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      handler,
    );

    expect(instance.eventList().size).toEqual(1);

    instance.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      handler,
    );

    expect(instance.eventList().size).toEqual(1);
  });

  it("should properly remove handlers", () => {
    const handler1 = () => {
      console.log("test");
    };

    const handler2 = () => {
      console.log("test2");
    };

    instance.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      handler1,
    );
    instance.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      handler1,
    );
    instance.addEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      handler2,
    );

    expect(instance.eventList().size).toEqual(3);

    instance.removeEventListener(
      EWalletObserverEvents.CONNECT_WALLET_START,
      handler1,
    );

    expect(instance.eventList().size).toEqual(2);

    instance.removeEventListener(
      EWalletObserverEvents.CONNECT_WALLET_END,
      handler1,
    );

    expect(instance.eventList().size).toEqual(1);
  });
});
