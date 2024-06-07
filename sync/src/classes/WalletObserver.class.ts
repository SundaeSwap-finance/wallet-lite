// import { Cardano, Serialization } from "@cardano-sdk/core";
import type { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
// import { typedHex } from "@cardano-sdk/util";
import { DAppPeerConnect } from "@fabianbormann/cardano-peer-connect";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import merge from "lodash/merge";

import { EWalletObserverEvents } from "../@types/events";
import type {
  IWalletObserverOptions,
  IWalletObserverSeed,
  TMetadataResolverFunc,
  TSupportWalletExtensions,
} from "../@types/observer";
import { onDisconnectHandler } from "../utils/handlers";
import { WalletBalanceMap } from "./WalletBalanceMap.class";
import { WalletObserverEvent } from "./WalletObserverEvent";

export class WalletObserver<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata
> extends WalletObserverEvent {
  static PERSISTENCE_CACHE_KEY = "walletObserver";
  static ADA_ASSET_ID = "ada.lovelace";
  public network: 0 | 1 = 0;
  public api?: Cip30WalletApi;
  public peerConnectInstance?: DAppPeerConnect;

  private _performingSync: boolean = false;
  private _activeWallet?: TSupportWalletExtensions;
  private _options: IWalletObserverOptions<AssetMetadata>;
  private _supportedExtensions: TSupportWalletExtensions[] = [
    "eternl",
    "lace",
    "typhon",
    "sorbet",
    "flint",
    "nami",
  ];

  // Caching
  private _cachedMetadata: Map<string, AssetMetadata> = new Map();

  constructor(options?: Partial<IWalletObserverOptions<AssetMetadata>>) {
    super();

    // Set options.
    this._options = merge<
      IWalletObserverOptions<AssetMetadata>,
      typeof options,
      Pick<IWalletObserverOptions<AssetMetadata>, "peerConnectArgs">
    >(
      {
        metadataResolver: this.__fallbackMetadataResolver,
        persistence: false,
      },
      options,
      {
        peerConnectArgs: {
          qrCodeTarget: "",
          dAppInfo: {
            name: "Placeholder dApp Connecter Name",
            url: window.location.hostname,
          },
          onApiEject: (name, address) => {
            console.log(name);
            options?.peerConnectArgs?.onApiEject(name, address);
            onDisconnectHandler();
            this.disconnect();
          },
          onApiInject: (name, address) => {
            options?.peerConnectArgs?.onApiInject(name, address);
            this.connectWallet(name as TSupportWalletExtensions).then(() =>
              console.log(this)
            );
          },
          verifyConnection(walletInfo, callback) {
            return callback(true, walletInfo.requestAutoconnect ?? true);
          },
          useWalletDiscovery: true,
          announce: [
            "wss://tracker.de-0.eternl.art",
            "wss://tracker.us-0.eternl.art",
          ],
        },
      }
    );

    if (!this._options.persistence) {
      return;
    }

    const savedWallet = window.localStorage.getItem(
      WalletObserver.PERSISTENCE_CACHE_KEY
    );

    if (!savedWallet) {
      return;
    }

    // Init connection
    const seed: IWalletObserverSeed = JSON.parse(savedWallet);
    this.connectWallet(seed.activeWallet);
  }

  sync = async () => {
    this._performingSync = true;
    this.dispatch(EWalletObserverEvents.SYNCING_WALLET_START);

    let newNetwork: 0 | 1;
    try {
      newNetwork = await this.getNetwork();
    } catch (e) {
      try {
        await this.syncApi();
        newNetwork = await this.getNetwork();
      } catch (e) {
        this.dispatch(EWalletObserverEvents.SYNCING_WALLET_END);
        this._performingSync = false;
        throw e;
      }
    }

    const [newBalanceMap, newUsedAddresses, newUnusedAddresses] =
      await Promise.all([
        this.getBalanceMap(),
        this.getUsedAddresses(),
        this.getUnusedAddresses(),
      ]).finally(() => {
        this.dispatch(EWalletObserverEvents.SYNCING_WALLET_END);
        this._performingSync = false;
      });

    this.dispatch(EWalletObserverEvents.SYNCING_WALLET_END);
    this._performingSync = false;

    return {
      balanceMap: newBalanceMap,
      usedAddresses: newUsedAddresses,
      unusedAddresses: newUnusedAddresses,
      network: newNetwork,
    };
  };

  isSyncing() {
    return this._performingSync;
  }

  syncApi = async (
    activeWallet?: TSupportWalletExtensions
  ): Promise<Cip30WalletApi> => {
    let attempts = 0;
    this.api = undefined;
    if (!activeWallet && !this._activeWallet) {
      throw new Error(
        "A wallet is required to be passed as a parameter, or to be defined in the class."
      );
    }

    const selectedWallet =
      activeWallet || (this._activeWallet as TSupportWalletExtensions);

    while (!this.api) {
      if (attempts === 10) {
        throw new Error(
          "Could not reconnect to the selected wallet. Please check your extension."
        );
      }

      try {
        const api = await window.cardano?.[selectedWallet]?.enable();

        if (!api) {
          throw Error;
        }

        this.api = api;
        this.network = await api.getNetworkId();
      } catch (e) {
        await new Promise((res) => setTimeout(res, 200));
        attempts++;
      }
    }

    return this.api;
  };

  getOptions = (): IWalletObserverOptions => {
    return this._options;
  };

  /**
   * Attempts to connect a wallet using the global window
   * reference. If no reference is found, it will retry for
   * 10 seconds before throw an error.
   *
   * @param {string} extension The name of the extension to enable.
   * @return {Promise<void>}
   */
  connectWallet = async (
    extension: TSupportWalletExtensions
  ): Promise<void> => {
    this.dispatch(EWalletObserverEvents.CONNECT_WALLET_START);
    let attempts = 0;
    let extensionObject = window.cardano?.[extension];

    // Disconnect any CIP45 connections.
    if (!extension.includes("p2p")) {
      this.peerConnectInstance?.shutdownServer();
    }

    while (typeof extensionObject === "undefined") {
      if (attempts === 40) {
        break;
      }

      await new Promise((res) => setTimeout(res, 500));
      extensionObject = window.cardano?.[extension];
      attempts++;
    }

    if (!extensionObject) {
      throw new Error("Wallet extension not found in the global context.");
    }

    await this.syncApi(extension);

    this._activeWallet = extension;
    if (this._options.persistence) {
      const seed: IWalletObserverSeed = {
        activeWallet: extension,
      };

      window.localStorage.setItem(
        WalletObserver.PERSISTENCE_CACHE_KEY,
        JSON.stringify(seed)
      );
    }

    this.dispatch(EWalletObserverEvents.CONNECT_WALLET_END, {
      extension,
    });
  };

  getCip45Instance = async () => {
    if (!this._options.peerConnectArgs) {
      throw new Error(
        "No CIP-45 peer connect arguments were provided when instantiating this WalletObserver instance!"
      );
    }

    if (!this.peerConnectInstance) {
      this.peerConnectInstance = new DAppPeerConnect(
        this._options.peerConnectArgs
      );
    }

    return {
      name: this._options.peerConnectArgs.dAppInfo.name,
      icon: this.peerConnectInstance.getIdenticon(),
      instance: this.peerConnectInstance,
    };
  };

  /**
   * Helper function to retrieve currently active wallet connection, if present.
   *
   * @returns {TSupportWalletExtensions | undefined}
   */
  getActiveWallet = (): TSupportWalletExtensions | undefined => {
    return this._activeWallet;
  };

  /**
   * Helper function to retrieve a list of supported wallet extensions.
   *
   * @returns {keyof TSupportWalletExtensions[] | undefined}
   */
  getSupportedExtensions = (): TSupportWalletExtensions[] => {
    return this._supportedExtensions;
  };

  /**
   * Helper function to restore the class instance to its initial state.
   *
   * @returns {void}
   */
  disconnect = (): void => {
    this._activeWallet = undefined;
    this.api = undefined;
    this._cachedMetadata = new Map();
    this.dispatch(EWalletObserverEvents.DISCONNECT);
  };

  /**
   * Retrieves the balance of the wallet, including metadata for each asset.
   *
   * @returns {Promise<WalletBalanceMap<AssetMetadata>>} - A promise that resolves to a map of asset amounts keyed by asset IDs.
   */
  getBalanceMap = async (): Promise<WalletBalanceMap<AssetMetadata>> => {
    if (!this.api) {
      throw new Error("Attempted to query balance without an API instance.");
    }

    this.dispatch(EWalletObserverEvents.GET_BALANCE_MAP_START);
    const cbor = await this.api.getBalance();
    const [Serialization, typedHex] = await Promise.all([
      import("@cardano-sdk/core").then(({ Serialization }) => Serialization),
      // @ts-ignore type exports are lame
      import("@cardano-sdk/util").then(({ typedHex }) => typedHex),
    ]);

    const data = Serialization.Value.fromCbor(typedHex(cbor));
    const multiassetKeys = data.multiasset()?.keys() ?? [];

    const metadata = await this.__metadataResolverWithCache([
      WalletObserver.ADA_ASSET_ID,
      ...multiassetKeys,
    ]);

    const balanceMap = new WalletBalanceMap<AssetMetadata>(this);
    balanceMap.set(
      WalletObserver.ADA_ASSET_ID,
      new AssetAmount(data.coin(), metadata.get(WalletObserver.ADA_ASSET_ID))
    );

    const multiassetEntries = data.multiasset()?.entries() ?? [];
    if (multiassetEntries) {
      for (const [id, amount] of multiassetEntries) {
        balanceMap.set(id, new AssetAmount(amount, metadata.get(id)));
      }
    }

    this.dispatch(EWalletObserverEvents.GET_BALANCE_MAP_END, {
      balanceMap,
    });

    return balanceMap;
  };

  /**
   * Gets the current network connection.
   *
   * @returns {Promise<0 | 1>} The network ID.
   */
  getNetwork = async (): Promise<0 | 1> => {
    if (!this.api) {
      throw new Error("Attempted to query network without an API instance.");
    }

    const val = await this.api.getNetworkId();
    this.network = val;
    return val;
  };

  /**
   * Gets a list of used addresses, encoded as Bech32.
   *
   * @returns {Promise<string[]>} The list of addresses.
   */
  getUsedAddresses = async (): Promise<string[]> => {
    if (!this.api) {
      throw new Error(
        "Attempted to query used addresses without an API instance."
      );
    }

    const cbor = await this.api.getUsedAddresses();
    const [Cardano, typedHex] = await Promise.all([
      await import("@cardano-sdk/core").then(({ Cardano }) => Cardano),
      // @ts-ignore type exports are lame
      await import("@cardano-sdk/util").then(({ typedHex }) => typedHex),
    ]);
    const data = cbor.map((val) =>
      Cardano.Address.fromBytes(typedHex(val)).toBech32()
    );

    return data;
  };

  /**
   * Gets a list of unused addresses, encoded as Bech32.
   *
   * @returns {Promise<string[]>} The list of addresses.
   */
  getUnusedAddresses = async (): Promise<string[]> => {
    if (!this.api) {
      throw new Error(
        "Attempted to query unused addresses without an API instance."
      );
    }

    const cbor = await this.api.getUnusedAddresses();
    const [Cardano, typedHex] = await Promise.all([
      await import("@cardano-sdk/core").then(({ Cardano }) => Cardano),
      // @ts-ignore type exports are lame
      await import("@cardano-sdk/util").then(({ typedHex }) => typedHex),
    ]);
    const data = cbor.map((val) =>
      Cardano.Address.fromBytes(typedHex(val)).toBech32()
    );

    return data;
  };

  /**
   * Resolves metadata for the given asset IDs, using a cached version if available.
   *
   * @private
   * @param {string[]} assetIds - The IDs of the assets to resolve metadata for.
   * @returns {Promise<Map<string, AssetMetadata>>} - A promise that resolves to a map of asset metadata.
   */
  private __metadataResolverWithCache = async (
    assetIds: string[]
  ): Promise<Map<string, AssetMetadata>> => {
    if (this._cachedMetadata) {
      const cachedKeys = new Set(this._cachedMetadata.keys());
      const inputKeys = new Set(assetIds);

      if (
        cachedKeys.size === inputKeys.size &&
        [...cachedKeys].every((key) => inputKeys.has(key))
      ) {
        return this._cachedMetadata;
      }
    }

    const newMetadata = await this._options.metadataResolver(assetIds);
    this._cachedMetadata = newMetadata;
    return newMetadata;
  };

  /**
   * A fallback metadata resolver function that generates default metadata for given asset IDs.
   *
   * @type {TMetadataResolverFunc<AssetMetadata>}
   */
  private __fallbackMetadataResolver: TMetadataResolverFunc<AssetMetadata> =
    async (assetIds) => {
      const map = new Map<string, AssetMetadata>();
      assetIds.forEach((id) =>
        map.set(id, {
          assetId: id,
          decimals: 6,
        } as AssetMetadata)
      );

      return map;
    };
}
