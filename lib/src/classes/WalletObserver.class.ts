import type { TransactionUnspentOutput } from "@cardano-sdk/core/dist/cjs/Serialization/index.js";
import {
  APIErrorCode,
  type ApiError,
  type Cip30WalletApi,
  type GetCollateral,
} from "@cardano-sdk/dapp-connector";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import merge from "lodash/merge.js";

import { EWalletObserverEvents } from "../@types/events.js";
import type {
  IResolvedWalletObserverOptions,
  IWalletObserverSeed,
  IWalletObserverSync,
  TMetadataResolverFunc,
  TSupportedWalletExtensions,
  TWalletObserverOptions,
} from "../@types/observer.js";
import { isAdaAsset, normalizeAssetIdWithDot } from "../utils/assets.js";
import {
  getCardanoCore,
  getCardanoUtil,
  getPeerConnect,
} from "../utils/getLibs.js";
import { WalletBalanceMap } from "./WalletBalanceMap.class.js";
import { WalletObserverEvent } from "./WalletObserverEvent.js";
import { WalletObserverUtils } from "./WalletObserverUtils.class.js";

/**
 * Class representing the Wallet Observer. This is the main interface
 * for interacting with a wallet extension that is available in the
 * browser window. It handles all the deserialization required when
 * querying raw data from a CIP-30 API, and converts it to readable and
 * usable interfaces.
 *
 * Notably, it extends the WalletObserverEvent class which
 * acts as an internal event handler to hook into actions, such as connecting,
 * syncing, and disconnecting.
 *
 * @template AssetMetadata - Type extending IAssetAmountMetadata.
 * @extends {WalletObserverEvent}
 */
export class WalletObserver<
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
> extends WalletObserverEvent {
  static PERSISTENCE_CACHE_KEY = "walletObserver";
  static ADA_ASSET_ID = "ada.lovelace";
  public network: number = 0;
  public api?: Cip30WalletApi;
  public activeWallet?: TSupportedWalletExtensions;
  public utils?: WalletObserverUtils;
  public peerConnectInstance?: import("@fabianbormann/cardano-peer-connect").DAppPeerConnect;

  private _performingSync: boolean = false;
  private _options: IResolvedWalletObserverOptions<AssetMetadata>;
  private _supportedExtensions: TSupportedWalletExtensions[] = [
    "eternl",
    "lace",
    "typhon",
    "sorbet",
    "flint",
    "nami",
  ];

  // Caching
  private _cachedMetadata: Map<string, AssetMetadata> = new Map();

  /**
   * Creates an instance of WalletObserver.
   *
   * @param {Partial<TWalletObserverOptions<AssetMetadata>>} [options] - Options for the wallet observer.
   */
  constructor(options?: Partial<TWalletObserverOptions<AssetMetadata>>) {
    super();

    // Set options.
    this._options = merge<IResolvedWalletObserverOptions, typeof options>(
      {
        metadataResolver: this.fallbackMetadataResolver,
        persistence: false,
        connectTimeout: 10000,
        debug: false,
        peerConnectArgs: {
          dAppInfo: {
            name: "Placeholder dApp Connecter Name",
            url: window.location.hostname,
          },
          onApiEject: (name, address) => {
            options?.peerConnectArgs?.onApiEject?.(name, address);
            this.disconnect();
          },
          onApiInject: (name, address) => {
            options?.peerConnectArgs?.onApiInject?.(name, address);
            this.connectWallet(name as TSupportedWalletExtensions);
          },
          verifyConnection(walletInfo, callback) {
            return callback(true, walletInfo.requestAutoconnect ?? true);
          },
          useWalletDiscovery: true,
          announce: [
            "wss://tracker.de-5.eternl.art",
            "wss://tracker.de-6.eternl.art",
            "wss://tracker.us-5.eternl.art",
          ],
        },
      },
      options,
    );

    if (!this._options.persistence) {
      return;
    }
  }

  /**
   * Synchronizes the wallet. This method handles syncing the class
   * against the currently selected active wallet. If the wallet has
   * changed networks, or if the account within the wallet has changed,
   * this method will automatically attempt to reconcile this error before
   * eventually throwing.
   *
   * In the event that a promise will not resolve due to external issues,
   * after 7 seconds, a timeout function will fire that resets the API and tries again.
   *
   * @returns {Promise<IWalletObserverSync<AssetMetadata>>} - A promise that resolves to the wallet sync data.
   */
  sync = async (): Promise<IWalletObserverSync<AssetMetadata>> => {
    if (!this.api) {
      throw new Error(
        "Attempted to perform a sync operation without a connected wallet.",
      );
    }

    const start = performance.now();

    try {
      this._performingSync = true;
      this.dispatch(EWalletObserverEvents.SYNCING_WALLET_START);

      let newNetwork: number;
      try {
        newNetwork = await this.getNetwork();
      } catch (e) {
        try {
          await this.syncApi();
          newNetwork = await this.getNetwork();
        } catch (e) {
          this.dispatch(EWalletObserverEvents.SYNCING_WALLET_END);
          this.dispatch(EWalletObserverEvents.CONNECT_WALLET_END);
          this._performingSync = false;
          throw e;
        }
      }

      const [
        newBalanceMap,
        newUsedAddresses,
        newUnusedAddresses,
        newOutputs,
        newCollateral,
      ] = await Promise.all([
        this.getBalanceMap(),
        this.getUsedAddresses(),
        this.getUnusedAddresses(),
        this.getUtxos(),
        this.getCollateral(),
      ]);

      const result = {
        balanceMap: newBalanceMap,
        usedAddresses: newUsedAddresses,
        unusedAddresses: newUnusedAddresses,
        utxos: newOutputs,
        collateral: newCollateral,
        network: newNetwork,
      };

      const end = performance.now();
      if (this._options.debug) {
        console.log(`sync: ${end - start}ms`);
      }

      this.dispatch(EWalletObserverEvents.SYNCING_WALLET_END, result);
      this.dispatch(EWalletObserverEvents.CONNECT_WALLET_END);
      this._performingSync = false;
      return result;
    } catch (e) {
      this._performingSync = false;
      this.dispatch(EWalletObserverEvents.SYNCING_WALLET_END);
      this.dispatch(EWalletObserverEvents.CONNECT_WALLET_END);
      throw e;
    }
  };

  /**
   * Helper method to check if the class is currently performing a sync
   * operation. This is useful to avoid duplicate calls, but does not
   * prevent it within the class.
   *
   * @returns {boolean}
   */
  isSyncing(): boolean {
    return this._performingSync;
  }

  /**
   * Helper method to check if the instance has an active connection.
   *
   * @returns {boolean}
   */
  hasActiveConnection(): boolean {
    return Boolean(this.activeWallet && this.api);
  }

  /**
   * Synchronizes the API with the wallet. This is useful if the account has changed,
   * but the underlying intent has not.
   *
   * @param {TSupportedWalletExtensions} [activeWallet] - The wallet to sync with.
   * @returns {Promise<Cip30WalletApi | undefined>} - A promise that resolves to the API instance.
   */
  syncApi = async (
    activeWallet?: TSupportedWalletExtensions,
  ): Promise<Cip30WalletApi | undefined> => {
    if (!activeWallet && !this.activeWallet) {
      throw new Error(
        "A wallet is required to be passed as a parameter, or to be defined in the class.",
      );
    }

    const selectedWallet =
      activeWallet || (this.activeWallet as TSupportedWalletExtensions);

    let attempts = 0;
    let shouldContinue = true;

    while (shouldContinue) {
      if (attempts === 10) {
        throw new Error(
          "Could not reconnect to the selected wallet. Please check your extension.",
        );
      }

      try {
        const api = await window.cardano?.[selectedWallet]?.enable();

        if (!api) {
          throw Error;
        }

        this.api = api;
        this.network = await api.getNetworkId();
        shouldContinue = false;
      } catch (e) {
        if (
          (e as Error)?.message === "user canceled connection" ||
          (e as ApiError)?.code === APIErrorCode.Refused
        ) {
          shouldContinue = false;
          return undefined;
        }

        await new Promise((res) => setTimeout(res, 200));
        attempts++;
      }
    }

    return this.api;
  };

  /**
   * Gets the options for the wallet observer.
   *
   * @returns {TWalletObserverOptions} - The wallet observer options.
   */
  getOptions = (): TWalletObserverOptions => {
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
    extension: TSupportedWalletExtensions,
  ): Promise<void> => {
    const start = performance.now();
    this.dispatch(EWalletObserverEvents.CONNECT_WALLET_START);

    let attempts = 0;
    let extensionObject = window.cardano?.[extension];

    // Disconnect any CIP45 connections.
    if (!extension?.includes("p2p")) {
      this.peerConnectInstance?.shutdownServer();
    }

    while (typeof extensionObject === "undefined") {
      if (attempts === 40) {
        break;
      }

      await new Promise((res) =>
        setTimeout(res, (this._options.connectTimeout as number) / 40),
      );
      extensionObject = window.cardano?.[extension];
      attempts++;
    }

    if (!extensionObject) {
      throw new Error("Wallet extension not found in the global context.");
    }

    await this.syncApi(extension);

    this.activeWallet = extension;
    if (this._options.persistence) {
      const seed: IWalletObserverSeed = {
        activeWallet: extension,
      };

      window.localStorage.setItem(
        WalletObserver.PERSISTENCE_CACHE_KEY,
        JSON.stringify(seed),
      );
    }

    const end = performance.now();
    if (this._options.debug) {
      console.log(`connectWallet: ${end - start}ms`);
    }
  };

  getCip45Instance = async () => {
    const start = performance.now();
    if (!this.peerConnectInstance) {
      const DAppPeerConnect = await getPeerConnect();
      this.peerConnectInstance = new DAppPeerConnect(
        this._options.peerConnectArgs,
      );
    }

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getCip45Instance: ${end - start}ms`);
    }

    return {
      name: this._options.peerConnectArgs.dAppInfo.name,
      icon: this.peerConnectInstance.getIdenticon(),
      instance: this.peerConnectInstance,
    };
  };

  /**
   * Helper function to retrieve the currently cached metadata.
   *
   * @returns {Map<string, AssetMetadata>}
   */
  getCachedAssetMetadata = (): Map<string, AssetMetadata> =>
    this._cachedMetadata;

  /**
   * Helper function to retrieve a list of supported wallet extensions.
   *
   * @returns {keyof TSupportedWalletExtensions[] | undefined}
   */
  getSupportedExtensions = (): TSupportedWalletExtensions[] => {
    return this._supportedExtensions;
  };

  /**
   * Helper function to restore the class instance to its initial state.
   *
   * @returns {void}
   */
  disconnect = (): void => {
    this.activeWallet = undefined;
    this.api = undefined;
    window.localStorage.removeItem(WalletObserver.PERSISTENCE_CACHE_KEY);
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

    const start = performance.now();

    this.dispatch(EWalletObserverEvents.GET_BALANCE_MAP_START);
    const [cbor, { Serialization }, typedHex] = await Promise.all([
      this.api.getBalance(),
      getCardanoCore(),
      getCardanoUtil(),
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
      new AssetAmount(data.coin(), metadata.get(WalletObserver.ADA_ASSET_ID)),
    );

    const multiassetEntries = data.multiasset()?.entries() ?? [];
    if (multiassetEntries) {
      for (const [id, amount] of multiassetEntries) {
        balanceMap.set(
          id,
          new AssetAmount(amount, metadata.get(normalizeAssetIdWithDot(id))),
        );
      }
    }

    this.dispatch(EWalletObserverEvents.GET_BALANCE_MAP_END, {
      balanceMap,
    });

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getBalanceMap: ${end - start}ms`);
    }
    return balanceMap;
  };

  /**
   * Gets the current network connection.
   *
   * @returns {Promise<number>} The network ID.
   */
  getNetwork = async (): Promise<number> => {
    if (!this.api) {
      throw new Error("Attempted to query network without an API instance.");
    }

    const start = performance.now();

    const val = await this.api.getNetworkId();
    this.network = val;

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getNetwork: ${end - start}ms`);
    }
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
        "Attempted to query used addresses without an API instance.",
      );
    }

    const start = performance.now();

    const [cbor, { Cardano }, typedHex] = await Promise.all([
      this.api.getUsedAddresses(),
      getCardanoCore(),
      getCardanoUtil(),
    ]);

    const data = cbor.map((val) =>
      Cardano.Address.fromBytes(typedHex(val)).toBech32(),
    );

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getUsedAddresses: ${end - start}ms`);
    }
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
        "Attempted to query unused addresses without an API instance.",
      );
    }

    const start = performance.now();

    const [cbor, { Cardano }, typedHex] = await Promise.all([
      this.api.getUnusedAddresses(),
      getCardanoCore(),
      getCardanoUtil(),
    ]);

    const data = cbor.map((val) =>
      Cardano.Address.fromBytes(typedHex(val)).toBech32(),
    );

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getUnusedAddresses: ${end - start}ms`);
    }
    return data;
  };

  /**
   * Gets a list of wallet UTXOs.
   *
   * @returns {Promise<TransactionUnspentOutput[]>} The list of TransactionUnspentOutputs.
   */
  getUtxos = async (): Promise<TransactionUnspentOutput[] | undefined> => {
    if (!this.api) {
      throw new Error("Attempted to query UTXOs without an API instance.");
    }

    const start = performance.now();

    const [cbor, { Serialization }, typedHex] = await Promise.all([
      this.api.getUtxos(),
      getCardanoCore(),
      getCardanoUtil(),
    ]);

    const data = cbor?.map((val) => {
      const txOutput = Serialization.TransactionUnspentOutput.fromCbor(
        typedHex(val),
      );

      // These methods must be bound to their initial creation instance.
      txOutput.input = txOutput.input.bind(txOutput);
      txOutput.output = txOutput.output.bind(txOutput);
      return txOutput;
    });

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getUtxos: ${end - start}ms`);
    }
    return data;
  };

  /**
   * Gets a list of wallet UTXOs suitable for collateral.
   *
   * @returns {Promise<TransactionUnspentOutput[]>} The list of TransactionUnspentOutputs.
   */
  getCollateral = async (): Promise<TransactionUnspentOutput[] | undefined> => {
    if (!this.api) {
      throw new Error("Attempted to query UTXOs without an API instance.");
    }

    const start = performance.now();

    const [cbor, { Serialization }, typedHex] = await Promise.all([
      (async () => {
        const funcCall =
          this.api?.getCollateral ||
          (this.api?.experimental.getCollateral as GetCollateral);
        if (typeof funcCall !== "function") {
          return [];
        }

        return await funcCall();
      })(),
      getCardanoCore(),
      getCardanoUtil(),
    ]);

    const data = cbor?.map((val) => {
      const txOutput = Serialization.TransactionUnspentOutput.fromCbor(
        typedHex(val),
      );

      // These methods must be bound to their initial creation instance.
      txOutput.input = txOutput.input.bind(txOutput);
      txOutput.output = txOutput.output.bind(txOutput);
      return txOutput;
    });

    const end = performance.now();
    if (this._options.debug) {
      console.log(`getCollateral: ${end - start}ms`);
    }
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
    assetIds: string[],
  ): Promise<Map<string, AssetMetadata>> => {
    const start = performance.now();

    if (this._cachedMetadata) {
      const cachedKeys = new Set(this._cachedMetadata.keys());
      const inputKeys = new Set(assetIds);

      if (
        cachedKeys.size === inputKeys.size &&
        [...cachedKeys].every((key) => inputKeys.has(key))
      ) {
        const end = performance.now();
        if (this._options.debug) {
          console.log(`metadataResolver (cached): ${end - start}ms`);
        }
        return this._cachedMetadata;
      }
    }

    let attempts = 0;
    let newMetadata: Map<string, AssetMetadata> | undefined;
    while (attempts <= 3 && !newMetadata) {
      try {
        newMetadata = await this._options.metadataResolver(
          assetIds.map(normalizeAssetIdWithDot),
          normalizeAssetIdWithDot,
          isAdaAsset,
        );
      } catch (e) {
        attempts++;
      }
    }

    if (!newMetadata) {
      newMetadata = await this.fallbackMetadataResolver(
        assetIds.map(normalizeAssetIdWithDot),
        normalizeAssetIdWithDot,
        isAdaAsset,
      );
    }

    this._cachedMetadata = newMetadata;

    const end = performance.now();
    if (this._options.debug) {
      console.log(`metadataResolver: ${end - start}ms`);
    }
    return newMetadata;
  };

  /**
   * A fallback metadata resolver function that generates default metadata for given asset IDs.
   *
   * @type {TMetadataResolverFunc<AssetMetadata>}
   */
  public fallbackMetadataResolver: TMetadataResolverFunc<AssetMetadata> =
    async (assetIds) => {
      const map = new Map<string, AssetMetadata>();
      assetIds.forEach((id) =>
        map.set(normalizeAssetIdWithDot(id), {
          assetId: normalizeAssetIdWithDot(id),
          decimals: 6,
        } as AssetMetadata),
      );

      return map;
    };

  /**
   * Helper method to retrieve the cached utils instance.
   *
   * @returns {Promise<WalletObserverUtils>} Resolves to a WalletObserverUtils class.
   */
  public async getUtils(): Promise<WalletObserverUtils> {
    if (!this.utils) {
      this.utils = await WalletObserverUtils.new(this.network);
    }

    return this.utils;
  }
}
