import capitalize from "lodash/capitalize";
import { useCallback, useEffect, useState } from "react";

import { IWalletExtension } from "../../@types/observer";
import { useWalletObserverContext } from "../contexts/observer";

export const useAvailableExtensions = () => {
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
        await new Promise((res) => setTimeout(res, 2000));
      }
    })();
  }, []);

  return list;
};
