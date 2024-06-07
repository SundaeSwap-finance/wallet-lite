import {
  EWalletObserverEventValues,
  TWalletObserverEventFunction,
} from "../@types/events";
import { areFunctionsEqual } from "../utils/comparisons";

/**
 * The base class for the WalletObserver class. This handles
 * the event-based tracking for all internal hooks.
 */
export class WalletObserverEvent {
  private _eventTarget: EventTarget;
  private _handlers: Map<string, Function> = new Map();

  constructor() {
    this._eventTarget = new EventTarget();
  }

  /**
   * Dispatches an event.
   *
   * @template E - The event type.
   * @param {E} event - The event to dispatch.
   * @param {EWalletObserverEventValues[E]} [data] - The data to pass with the event.
   */
  dispatch = <E extends keyof EWalletObserverEventValues>(
    event: E,
    data?: EWalletObserverEventValues[E]
  ) => {
    this._eventTarget.dispatchEvent(new CustomEvent(event, { detail: data }));
  };

  /**
   * Adds an event listener.
   *
   * @template E - The event type.
   * @param {E} event - The event to listen for.
   * @param {TWalletObserverEventFunction<E>} callback - The callback function to execute when the event is triggered.
   * @returns {void}
   */
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
    this._eventTarget.addEventListener(event as string, handler);
  };

  /**
   * Removes an event listener.
   *
   * @template E - The event type.
   * @param {E} event - The event to remove the listener from.
   * @param {TWalletObserverEventFunction<E>} callback - The callback function to remove.
   * @param {boolean | EventListenerOptions} [options] - Additional options for removing the listener.
   */
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

    this._eventTarget.removeEventListener(
      event as string,
      callback as unknown as EventListenerOrEventListenerObject,
      options
    );
  };

  /**
   * Queries the currently registered events. This is useful
   * if you want to expose these and remove any.
   *
   * @returns {Map<string, Function>} - A map of registered event handlers.
   */
  queryEvents(): Map<string, Function> {
    return this._handlers;
  }

  /**
   * Generates a unique key for the event and callback function.
   *
   * @private
   * @template E - The event type.
   * @param {E} event - The event type.
   * @param {TWalletObserverEventFunction<E>} callback - The callback function.
   * @returns {string} - The unique key for the event and callback.
   */
  private __getEventKey<E extends keyof EWalletObserverEventValues>(
    event: E,
    callback: TWalletObserverEventFunction<E>
  ): string {
    return `${event}-${this.__getFunctionHash(callback)}`;
  }

  /**
   * Generates a hash for the callback function.
   *
   * @private
   * @template E - The event type.
   * @param {TWalletObserverEventFunction<E>} callback - The callback function.
   * @returns {number} - The hash of the callback function.
   */
  private __getFunctionHash<E extends keyof EWalletObserverEventValues>(
    callback: TWalletObserverEventFunction<E>
  ): number {
    const str = callback.toString();
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }

    return hash >>> 0; // Convert to unsigned 32-bit integer
  }
}
