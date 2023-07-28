// Copyright © Max Kaplan

import {
  AptosAccount,
  AptosClient,
  FaucetClient,
  BCS,
  TxnBuilderTypes,
} from "aptos";
import bmp from "bmp-js";
import * as fs from "fs";
import { PromisePool } from "@supercharge/promise-pool";
import fetch from "node-fetch";

export {};

const {
  AccountAddress,
  ChainId,
  EntryFunction,
  RawTransaction,
  TransactionPayloadEntryFunction,
} = TxnBuilderTypes;

const CLIENT = new AptosClient("https://fullnode.testnet.aptoslabs.com");

const PIXEL_SIZE = 4; // 4 bytes per pixel (ABGR)

class AccountPool {
  private totalAccounts: number = 0;

  constructor(public accounts: AptosAccount[] = []) {
    this.totalAccounts = accounts.length;
  }

  async getAccount(): Promise<AptosAccount> {
    if (this.accounts.length === 0) {
      this.accounts.push(await createAndFundAccount());
      console.log(
        "created new account",
        this.accounts.length,
        "/",
        this.totalAccounts
      );
    }
    return this.accounts.pop()!;
  }

  returnAccount(account: AptosAccount) {
    this.accounts.push(account);
  }

  async withAccount<T>(fn: (account: AptosAccount) => Promise<T>): Promise<T> {
    const account = await this.getAccount();
    let result;
    try {
      result = await fn(account);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      this.returnAccount(account);
    }
    return result;
  }
}

async function createAndFundAccount(): Promise<AptosAccount> {
  const account = new AptosAccount();
  const faucetClient = new FaucetClient(
    "https://fullnode.testnet.aptoslabs.com",
    "https://faucet.testnet.aptoslabs.com",
    // Read token from env if present.
    {
      TOKEN: process.env.FAUCET_TOKEN,
    }
  );

  await Promise.all([
    faucetClient.fundAccount(account.address().hex(), 100 * 10_000_000),
    faucetClient.fundAccount(account.address().hex(), 100 * 10_000_000),
    faucetClient.fundAccount(account.address().hex(), 100 * 10_000_000),
    faucetClient.fundAccount(account.address().hex(), 100 * 10_000_000),
    faucetClient.fundAccount(account.address().hex(), 100 * 10_000_000),
  ]);
  return account;
}

async function drawPoint(
  account: AptosAccount,
  tokenAddress: string,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number
) {
  const entryFunctionPayload = new TransactionPayloadEntryFunction(
    EntryFunction.natural(
      "0x6286dfd5e2778ec069d5906cd774efdba93ab2bec71550fa69363482fbd814e7::canvas_token",
      "draw",
      [],
      [
        BCS.bcsToBytes(AccountAddress.fromHex(tokenAddress)),
        BCS.bcsSerializeUint64(x),
        BCS.bcsSerializeUint64(y),
        BCS.bcsSerializeU8(r),
        BCS.bcsSerializeU8(g),
        BCS.bcsSerializeU8(b),
      ]
    )
  );

  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    CLIENT.getAccount(account.address()),
    CLIENT.getChainId(),
  ]);

  const rawTxn = new RawTransaction(
    // Transaction sender account address
    AccountAddress.fromHex(account.address()),
    BigInt(sequenceNumber),
    entryFunctionPayload,
    // Max gas unit to spend
    BigInt(50000),
    // Gas price per unit
    BigInt(100),
    // Expiration timestamp. Transaction is discarded if it is not executed within 10 seconds from now.
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new ChainId(chainId)
  );

  // Sign the raw transaction with account1's private key
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);

  const transactionRes = await CLIENT.submitSignedBCSTransaction(bcsTxn);
  await CLIENT.waitForTransaction(transactionRes.hash, { checkSuccess: true });
  console.log("put dot:", tokenAddress, [x, y], [r, g, b], transactionRes.hash);
}

// Get the current pixels
async function getPixels(tokenAddress: string) {
  const res = await fetch(
    `https://fullnode.testnet.aptoslabs.com/v1/accounts/${tokenAddress}/resources?limit=9999`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        Referer: "https://canvas.dport.me/",
      },
      body: null,
      method: "GET",
    }
  );
  const body: any = await res.json();
  const dataItem = body.filter((r: any) =>
    (r.type as string).includes("canvas_token::Canvas")
  )[0];
  const pixels: { r: number; g: number; b: number }[] = dataItem.data.pixels;
  return pixels;
}

function loadImage(imgPath: string) {
  const bmpBuffer = fs.readFileSync(imgPath);
  const bmpData = bmp.decode(bmpBuffer);

  console.log(
    "Width",
    bmpData.width,
    "Height",
    bmpData.height,
    "Length",
    bmpData.data.length
  );

  let toDraw = [];

  // Loop through the pixel data, jumping 4 positions at a time (B, G, R, and unused byte)
  for (let i = 0; i < bmpData.data.length; i += 4) {
    // Calculate the x and y coordinates
    let index = i / 4;
    let x = index % bmpData.width;
    let y = Math.floor(index / bmpData.width);

    let r = bmpData.data[i + 3];
    let g = bmpData.data[i + 2];
    let b = bmpData.data[i + 1];

    // Push the RGB values and coordinates to the array
    toDraw.push([x, y, r, g, b]);
  }

  return { toDraw, width: bmpData.width, height: bmpData.height };
}

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function excludeExistingPixels(
  toDraw: any[],
  width: number,
  tokenAddress: string
) {
  const pixels = await getPixels(tokenAddress);
  const filteredToDraw = toDraw.filter(([x, y, r, g, b]) => {
    const index = y * width + x;
    const currentPixel = pixels[index];
    if (!currentPixel)
      throw new Error(`no current pixel: ${x}, ${y}, ${index}`);
    if (currentPixel.r != r || currentPixel.g != g || currentPixel.b != b) {
      return true;
    } else {
      // console.log("no change:", tokenAddress, [x, y], [r, g, b]);
    }
  });
  console.log(
    "Filtered existing pixels from",
    toDraw.length,
    "to",
    filteredToDraw.length
  );
  return filteredToDraw;
}

async function main() {
  const res = loadImage("img/hokusai.bmp");

  // Shuffle to make it fun
  shuffleArray(res.toDraw);

  // Make some accounts
  const numAccounts = 35;
  const accounts = await Promise.all(
    Array.from({ length: numAccounts }).map(() => createAndFundAccount())
  );

  const accountPool = new AccountPool(accounts);
  const tokenAddress =
    "0x267d2de5c2e65ebc33566128e99ab76f433b1d6f6cdfc62e71c6d2e93e132a7f";
  const outputEvery = 100;

  const filteredToDraw = await excludeExistingPixels(
    res.toDraw,
    res.width,
    tokenAddress
  );

  let drawn = 0;
  const { results, errors } = await PromisePool.for(filteredToDraw)
    .withConcurrency(numAccounts)
    .process(async (drawParams: any, index: number) => {
      const [x, y, r, g, b] = drawParams;
      await accountPool.withAccount(async (account) => {
        await drawPoint(account, tokenAddress, x, y, r, g, b);
      });
      drawn += 1;
      if (drawn % outputEvery == 0)
        console.log(
          `drawn ${drawn} / ${filteredToDraw.length} pixels (${(
            (drawn / filteredToDraw.length) *
            100
          ).toFixed(2)}%)`
        );
    });
}

main();
