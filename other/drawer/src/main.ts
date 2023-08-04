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
import { createCanvas, loadImage } from "canvas";

export {};

const MODULE_ADDRESS =
  "0x481d6509302e3379b9a8cf524da0000feee18f811d1da7e5addc7f64cdaaac60";

const CANVAS_TO_DRAW_ON =
  "0xb693adc2b70c693019217e95b539a7a3fdd92a033dc491745c0d3ec464807fb1";

type Pixel = {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
};

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
      `${MODULE_ADDRESS}::canvas_token`,
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
  // console.log("put dot:", tokenAddress, [x, y], [r, g, b], transactionRes.hash);
}

// Get the current pixels
async function getPixels(tokenAddress: string): Promise<Pixel[]> {
  const res = await loadImagePng(
    `https://canvas-processor-testnet.dport.me/media/${tokenAddress}.png`
  );
  return res.toDraw;
}

function loadImageBmp(imgPath: string): {
  toDraw: any[];
  width: number;
  height: number;
} {
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
    toDraw.push({ x, y, r, g, b });
  }

  return { toDraw, width: bmpData.width, height: bmpData.height };
}

async function loadImagePng(
  imgPath: string
): Promise<{ toDraw: Pixel[]; width: number; height: number }> {
  const image = await loadImage(imgPath);
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  if (ctx === undefined) {
    throw "No canvas";
  }

  canvas.width = image.width;
  canvas.height = image.height;

  ctx!.drawImage(image, 0, 0);
  const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const color = {
      x: (i / 4) % canvas.width,
      y: Math.floor(i / 4 / canvas.width),
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2],
    };

    pixels.push(color);
  }

  return { toDraw: pixels, width: canvas.width, height: canvas.height };
}

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// TODO: Before running this code again, make this function work.
async function excludeExistingPixels(
  toDraw: Pixel[],
  width: number,
  tokenAddress: string
) {
  const pixels = await getPixels(tokenAddress);
  const filteredToDraw = toDraw.filter(({ x, y, r, g, b }) => {
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
  // const res = loadImageBmp("img/hokusai.bmp");
  const res = await loadImagePng("img/saturn.png");

  // Shuffle to make it fun
  shuffleArray(res.toDraw);

  // Make some accounts
  const numAccounts = 25;
  const accounts = await Promise.all(
    Array.from({ length: numAccounts }).map(() => createAndFundAccount())
  );

  const accountPool = new AccountPool(accounts);
  const tokenAddress = CANVAS_TO_DRAW_ON;

  const filteredToDraw = await excludeExistingPixels(
    res.toDraw,
    res.width,
    tokenAddress
  );

  const outputEvery = 100;
  let drawn = 0;
  const { results, errors } = await PromisePool.for(filteredToDraw)
    .withConcurrency(numAccounts)
    .process(async (drawParams: any, index: number) => {
      const { x, y, r, g, b } = drawParams;
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

  console.log("Number of errors", errors.length);
  if (errors.length > 0) {
    console.log("First error in vector: ", errors[0]);
  }
}

main();
