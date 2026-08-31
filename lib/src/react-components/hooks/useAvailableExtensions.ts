import capitalize from "lodash/capitalize.js";
import { useCallback, useEffect, useState } from "react";

import { IWindowCip30Extension } from "../../@types/observer.js";

/**
 * Defines the interface for a returned wallet
 */
export interface IWalletExtension {
  property: string;
  name: string;
  reference: IWindowCip30Extension;
}

interface IAvailableExtensions {
  fingerprint: string;
  list: IWalletExtension[];
}

/**
 * Reads the identifying properties of an injected extension without trusting
 * it. Extensions are third-party code: some inject Proxy-wrapped objects
 * whose traps throw on property access, or violate Proxy invariants (which
 * the engine converts to a TypeError — e.g. "'get' on proxy: property
 * 'prototype' is a read-only and non-configurable data property..."). An
 * extension that cannot answer these two reads is excluded from the list
 * instead of being allowed to crash the render.
 */
const readExtensionIdentity = (
  extension: IWindowCip30Extension,
): { apiVersion: string; name: string } | undefined => {
  try {
    const { apiVersion, name } = extension ?? {};
    if (!apiVersion) {
      return undefined;
    }

    return { apiVersion: String(apiVersion), name: String(name ?? "") };
  } catch {
    return undefined;
  }
};

/**
 * A helper hook to get a live list of wallet extensions, populated
 * during the first 5 minutes of a window's load. This is because some
 * wallet extensions are slow to inject their APIs into the global scope.
 *
 * Injected extensions are never deep-compared: only their key, name, and
 * apiVersion are read, and change detection uses a fingerprint of those
 * strings. Deep comparison walks arbitrary properties of untrusted objects,
 * which throws on Proxy-based injections (see readExtensionIdentity).
 *
 * @returns {IWalletExtension[]} A list of available wallet extensions.
 */
export const useAvailableExtensions = (intervalAmount?: number) => {
  const getAvailableExtensions = useCallback((): IAvailableExtensions => {
    let entries: [string, IWindowCip30Extension][] = [];
    try {
      const namespace = window?.cardano || window?.parent?.cardano;
      entries = Object.entries(namespace || {});
    } catch {
      // window.parent is cross-origin when the dapp is embedded in a frame;
      // reading properties on it throws a SecurityError.
    }

    const list: IWalletExtension[] = [];
    const fingerprints: string[] = [];
    for (const [key, extension] of entries) {
      const identity = readExtensionIdentity(extension);
      if (!identity) {
        continue;
      }

      list.push({
        name: capitalize(identity.name),
        property: key,
        reference: extension,
      });
      fingerprints.push(
        `${key}\u0000${identity.name}\u0000${identity.apiVersion}`,
      );
    }

    return { fingerprint: fingerprints.sort().join("\u0001"), list };
  }, []);

  const [extensions, setExtensions] = useState<IAvailableExtensions>(
    getAvailableExtensions,
  );

  useEffect(() => {
    const checkForUpdates = () => {
      const updated = getAvailableExtensions();
      setExtensions((prev) =>
        prev.fingerprint === updated.fingerprint ? prev : updated,
      );
    };

    const interval = setInterval(checkForUpdates, intervalAmount || 1000);

    // Stop checking after 5 minutes;
    const stop = setTimeout(() => {
      clearInterval(interval);
    }, 60000 * 5);

    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [getAvailableExtensions, intervalAmount]);

  return extensions.list;
};
