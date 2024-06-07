import {
  EWalletObserverEventValues,
  TWalletObserverEventFunction,
} from "../@types/events";
import { areFunctionsEqual } from "../utils/comparisons";

export class WalletObserverEvent {
  private eventTarget: EventTarget;
  private _handlers: Map<string, Function> = new Map();

  constructor() {
    this.eventTarget = new EventTarget();
  }

  dispatch = <E extends keyof EWalletObserverEventValues>(
    event: E,
    data?: EWalletObserverEventValues[E]
  ) => {
    this.eventTarget.dispatchEvent(new CustomEvent(event, { detail: data }));
  };

  addEventListener = <E extends keyof EWalletObserverEventValues>(
    event: E,
    callback: TWalletObserverEventFunction<E>
  ): void => {
    const key = this.__getEventKey(event, callback);
    // Ensure no duplicate handlers.
    if (this._handlers.has(key)) {
      const func = this._handlers.get(key);
      if (!func || areFunctionsEqual(func, callback)) {
        return;
      }
    }

    const handler = (e: Event) => {
      callback((e as CustomEvent)?.detail);
    };

    this._handlers.set(key, handler);
    this.eventTarget.addEventListener(event as string, handler);
  };

  removeEventListener = <E extends keyof EWalletObserverEventValues>(
    event: E,
    callback: TWalletObserverEventFunction<E>,
    options?: boolean | EventListenerOptions
  ) => {
    const key = this.__getEventKey(event, callback);
    const func = this._handlers.get(key);
    if (func && this._handlers.has(key) && areFunctionsEqual(callback, func)) {
      this._handlers.delete(key);
    }

    this.eventTarget.removeEventListener(
      event as string,
      callback as unknown as EventListenerOrEventListenerObject,
      options
    );
  };

  queryEvents() {
    return this._handlers;
  }

  private __getEventKey<E extends keyof EWalletObserverEventValues>(
    event: E,
    callback: TWalletObserverEventFunction<E>
  ) {
    return `${event}-${this.__getFunctionHash(callback)}`;
  }

  private __getFunctionHash<E extends keyof EWalletObserverEventValues>(
    callback: TWalletObserverEventFunction<E>
  ) {
    const str = callback.toString();
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }

    return hash >>> 0; // Convert to unsigned 32-bit integer
  }
}
