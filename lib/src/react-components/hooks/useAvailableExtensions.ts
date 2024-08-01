import capitalize from "lodash/capitalize.js";
import isEqual from "lodash/isEqual.js";
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

/**
 * A helper hook to get a live list of wallet extensions, populated
 * during the first 20 seconds of a window's load. This is because some
 * wallet extensions are slow to inject their APIs into the global scope.
 *
 * @returns {IWalletExtension[]} A list of available wallet extensions.
 */
export const useAvailableExtensions = (intervalAmount?: number) => {
  const getSanitizedCardanoNamespace = useCallback(() => {
    const newCardano = window?.cardano || window?.parent?.cardano;
    const sanitizedExtension: { [key: string]: IWindowCip30Extension } = {};
    for (const [key, val] of Object.entries(newCardano || {})) {
      if (!val?.apiVersion) {
        continue;
      }

      sanitizedExtension[key] = val;
    }

    return sanitizedExtension;
  }, []);

  const [list, setList] = useState<IWalletExtension[]>([]);
  const [cardano, setCardano] = useState<
    | {
        [key: string]: IWindowCip30Extension;
      }
    | undefined
  >(getSanitizedCardanoNamespace());

  useEffect(() => {
    const checkForUpdates = () => {
      const supportedExtensions = getSanitizedCardanoNamespace();
      setCardano((prevCardano) => {
        if (isEqual(prevCardano, supportedExtensions)) {
          return prevCardano;
        }

        return supportedExtensions;
      });
    };

    const interval = setInterval(checkForUpdates, intervalAmount || 1000);

    // Stop checking after 5 minutes;
    setTimeout(() => {
      clearInterval(interval);
    }, 60000 * 5);

    return () => clearInterval(interval);
  }, [cardano]);

  useEffect(() => {
    if (!cardano) {
      return;
    }

    const newList: IWalletExtension[] = [];
    Object.entries(cardano).forEach(([key, extension]) => {
      if (extension) {
        newList.push({
          name: capitalize(extension.name),
          property: key,
          reference: extension,
        });
      }
    });

    setList(newList);
  }, [cardano]);

  return list;
};
