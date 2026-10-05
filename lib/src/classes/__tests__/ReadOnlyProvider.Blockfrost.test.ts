import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { Serialization } from "@cardano-sdk/core";
import { HexBlob } from "@cardano-sdk/util";
import { ReadOnlyBlockfrostProvider } from "../ReadOnlyProvider.Blockfrost.class.js";

const address =
  "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s";
const sundae =
  "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d7753554e444145";
const hosky =
  "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59";

type TRoute = { status: number; body: unknown };

const realFetch = globalThis.fetch;
let routes: Record<string, TRoute>;
let requested: string[];

const notFound: TRoute = {
  status: 404,
  body: { status_code: 404, error: "Not Found", message: "Not found" },
};

const utxo = (index: number, extra: Record<string, unknown> = {}) => ({
  tx_hash: index.toString(16).padStart(64, "0"),
  output_index: index % 3,
  address,
  amount: [{ unit: "lovelace", quantity: String(1_000_000 + index) }],
  inline_datum: null,
  data_hash: null,
  ...extra,
});

const utxosPath = (page: number) =>
  `/addresses/${address}/utxos?count=100&page=${page}`;

const decodeUtxo = (cbor: string) =>
  Serialization.TransactionUnspentOutput.fromCbor(HexBlob(cbor));

beforeEach(() => {
  routes = {};
  requested = [];
  globalThis.fetch = mock(async (url: string | URL | Request) => {
    const path = String(url).replace(
      /^https:\/\/cardano-[a-z]+\.blockfrost\.io\/api\/v0/,
      "",
    );
    requested.push(String(url));
    const { status, body } = routes[path] ?? notFound;
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("ReadOnlyBlockfrostProvider", () => {
  test("getBalance sums repeated units into one value", async () => {
    routes[`/addresses/${address}`] = {
      status: 200,
      body: {
        amount: [
          { unit: "lovelace", quantity: "5000000" },
          { unit: sundae, quantity: "42" },
          { unit: sundae, quantity: "8" },
          { unit: hosky, quantity: "7" },
        ],
      },
    };

    const cbor = await new ReadOnlyBlockfrostProvider("preview123").getBalance(
      address,
      0,
    );
    const value = Serialization.Value.fromCbor(HexBlob(cbor));

    expect(value.coin()).toBe(5_000_000n);
    expect(Object.fromEntries(value.multiasset() ?? [])).toEqual({
      [sundae]: 50n,
      [hosky]: 7n,
    });
  });

  test("getBalance treats a missing amount as zero lovelace", async () => {
    routes[`/addresses/${address}`] = { status: 200, body: {} };

    const cbor = await new ReadOnlyBlockfrostProvider("preview123").getBalance(
      address,
      0,
    );
    const value = Serialization.Value.fromCbor(HexBlob(cbor));

    expect(value.coin()).toBe(0n);
    expect(value.multiasset()?.size ?? 0).toBe(0);
  });

  test("getBalance throws on an error response", async () => {
    await expect(
      new ReadOnlyBlockfrostProvider("preview123").getBalance(address, 0),
    ).rejects.toThrow("Blockfrost getBalance failed: Not found");
  });

  test("getUtxos keeps inline datums and datum hashes", async () => {
    const datumHash = "c".repeat(64);
    routes[utxosPath(1)] = {
      status: 200,
      body: [
        utxo(1, {
          amount: [
            { unit: "lovelace", quantity: "2000000" },
            { unit: sundae, quantity: "7" },
          ],
          inline_datum: "d87980",
        }),
        utxo(2, { data_hash: datumHash }),
      ],
    };

    const [first, second] = (
      await new ReadOnlyBlockfrostProvider("preview123").getUtxos(address, 0)
    ).map(decodeUtxo);

    expect(first.input().transactionId()).toBe(utxo(1).tx_hash);
    expect(first.input().index()).toBe(1n);
    expect(first.output().address().toBech32()).toBe(address);
    expect(first.output().amount().coin()).toBe(2_000_000n);
    expect(
      Object.fromEntries(first.output().amount().multiasset() ?? []),
    ).toEqual({ [sundae]: 7n });
    expect(first.output().datum()?.asInlineData()?.toCbor()).toBe("d87980");

    expect(second.output().datum()?.asDataHash()).toBe(datumHash);
  });

  test("getUtxos pages until a short page", async () => {
    routes[utxosPath(1)] = {
      status: 200,
      body: Array.from({ length: 100 }, (_, i) => utxo(i)),
    };
    routes[utxosPath(2)] = {
      status: 200,
      body: Array.from({ length: 3 }, (_, i) => utxo(100 + i)),
    };

    const utxos = await new ReadOnlyBlockfrostProvider("preview123").getUtxos(
      address,
      0,
    );

    expect(utxos).toHaveLength(103);
    expect(decodeUtxo(utxos[102]).input().transactionId()).toBe(
      utxo(102).tx_hash,
    );
  });

  test("getUtxos returns nothing for an address with no UTxOs", async () => {
    routes[utxosPath(1)] = { status: 200, body: [] };

    expect(
      await new ReadOnlyBlockfrostProvider("preview123").getUtxos(address, 0),
    ).toEqual([]);
  });

  test("getUtxos throws when the first page fails", async () => {
    await expect(
      new ReadOnlyBlockfrostProvider("preview123").getUtxos(address, 0),
    ).rejects.toThrow("Blockfrost getUtxos failed: Not found");
  });

  test("getUtxos stops at a failed later page", async () => {
    routes[utxosPath(1)] = {
      status: 200,
      body: Array.from({ length: 100 }, (_, i) => utxo(i)),
    };

    const utxos = await new ReadOnlyBlockfrostProvider("preview123").getUtxos(
      address,
      0,
    );

    expect(utxos).toHaveLength(100);
  });

  test("picks the network from the argument and project id", async () => {
    routes[`/addresses/${address}`] = { status: 200, body: {} };

    await new ReadOnlyBlockfrostProvider("mainnet123").getBalance(address, 1);
    await new ReadOnlyBlockfrostProvider("preprod123").getBalance(address, 0);
    await new ReadOnlyBlockfrostProvider("preview123").getBalance(address, 0);

    expect(requested.map((url) => new URL(url).hostname)).toEqual([
      "cardano-mainnet.blockfrost.io",
      "cardano-preprod.blockfrost.io",
      "cardano-preview.blockfrost.io",
    ]);
  });
});
