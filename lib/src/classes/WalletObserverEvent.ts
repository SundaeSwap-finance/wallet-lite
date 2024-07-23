import {
  IWalletObserverEventValues,
  TWalletObserverEventFunction,
} from "../@types/events.js";
import { getEventKey } from "../utils/hashing.js";

/**
 * The base class for the WalletObserver class. This handles
 * the event-based tracking for all internal hooks.
 */
export class WalletObserverEvent {
  private _eventTarget: EventTarget;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _handlers: Map<string, (...params: any) => void> = new Map();

  constructor() {
    this._eventTarget = new EventTarget();
  }

  /**
   * Dispatches an event.
   *
   * @template E - The event type.
   * @param {E} event - The event to dispatch.
   * @param {IWalletObserverEventValues[E]} [data] - The data to pass with the event.
   */
  dispatch = <E extends keyof IWalletObserverEventValues>(
    event: E,
    data?: IWalletObserverEventValues[E],
  ) => {
    this._eventTarget.dispatchEvent(
      new CustomEvent(event as string, { detail: data }),
    );
  };

  /**
   * Adds an event listener.
   *
   * @template E - The event type.
   * @param {E} event - The event to listen for.
   * @param {TWalletObserverEventFunction<E>} callback - The callback function to execute when the event is triggered.
   * @returns {void}
   */
  addEventListener = <E extends keyof IWalletObserverEventValues>(
    event: E,
    callback: TWalletObserverEventFunction<E>,
  ): void => {
    const key = getEventKey(event, callback);

    // Ensure no duplicate handlers.
    if (this._handlers.has(key)) {
      const func = this._handlers.get(key);
      if (func) {
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
  removeEventListener = <E extends keyof IWalletObserverEventValues>(
    event: E,
    callback: TWalletObserverEventFunction<E>,
    options?: boolean | EventListenerOptions,
  ) => {
    const key = getEventKey(event, callback);
    const func = this._handlers.get(key);

    if (func) {
      this._handlers.delete(key);
      this._eventTarget.removeEventListener(
        event as string,
        func as unknown as EventListenerOrEventListenerObject,
        options,
      );
    }
  };

  /**
   * Queries the currently registered events. This is useful
   * if you want to expose these and remove any.
   *
   * @returns {Map<string, () => void>} - A map of registered event handlers.
   */
  eventList(): Map<string, () => void> {
    return this._handlers;
  }
}
