import capitalize from "lodash/capitalize";
import { useCallback, useEffect, useState } from "react";

import { ObserverTypes } from "../../exports";
import { useWalletObserverContext } from "../contexts/observer";

/**
 * Defines the interface for a returned wallet
 */
export interface IWalletExtension {
  property: ObserverTypes.TSupportWalletExtensions;
  name: string;
}

/**
 * A helper hook to get a live list of wallet extensions, populated
 * during the first 20 seconds of a window's load. This is because some
 * wallet extensions are slow to inject their APIs into the global scope.
 *
 * @returns {IWalletExtension[]} A list of available wallet extensions.
 */
export const useAvailableExtensions = (refreshInterval?: number) => {
  const { observerRef } = useWalletObserverContext();
  const [list, setList] = useState<IWalletExtension[]>([]);

  const updateExtensions = useCallback(() => {
    if (!window.cardano) {
      return;
    }

    const list: IWalletExtension[] = [];
    observerRef.current.getSupportedExtensions().forEach((key) => {
      const extension = window.cardano?.[key];

      if (extension) {
        list.push({
          name: capitalize(extension.name),
          property: key,
        });
      }
    });

    setList((prevExtensions) => {
      if (list.length > prevExtensions.length) {
        return list;
      }

      return prevExtensions;
    });
  }, [observerRef]);

  useEffect(() => {
    updateExtensions();

    // Check every 2 seconds for 20 seconds (late loading extensions.)
    (async () => {
      for (let i = 0; i < 20; i++) {
        updateExtensions();
        await new Promise((res) => setTimeout(res, refreshInterval || 2000));
      }
    })();
  }, []);

  return list;
};
