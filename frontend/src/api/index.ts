import {
  AnsClient,
  AptosClient,
  CoinClient,
  Network,
  Provider,
  Types,
} from "aptos";
import { withResponseError } from "./client";
import { NetworkName } from "../constants";

export function getLedgerInfoWithoutResponseError(
  nodeUrl: string,
): Promise<Types.IndexResponse> {
  const client = new AptosClient(nodeUrl);
  return client.getLedgerInfo();
}

export function getAccountResources(
  requestParameters: { address: string; ledgerVersion?: number },
  nodeUrl: string,
): Promise<Types.MoveResource[]> {
  const client = new AptosClient(nodeUrl);
  const { address, ledgerVersion } = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResources(address, { ledgerVersion: ledgerVersionBig }),
  );
}

export function getCoinBalance(
  requestParameters: { address: string; coinType?: string },
  nodeUrl: string,
): Promise<bigint> {
  const client = new AptosClient(nodeUrl);
  const coinClient = new CoinClient(client);
  const { address, coinType } = requestParameters;
  return withResponseError(coinClient.checkBalance(address, { coinType }));
}

export async function getAptBalance(
  requestParameters: { address: string },
  nodeUrl: string,
): Promise<number> {
  return Number(
    await getCoinBalance({ address: requestParameters.address }, nodeUrl),
  );
}

export async function getPntBalance(
  requestParameters: { address: string; pntMetadataAddress: string },
  nodeUrl: string,
): Promise<number> {
  return Number(
    await getCoinBalance(
      {
        address: requestParameters.address,
        coinType: requestParameters.pntMetadataAddress,
      },
      nodeUrl,
    ),
  );
}

function getAnsClient(network: NetworkName): AnsClient {
  // https://stackoverflow.com/a/42623905/3846032
  const s = network as string;
  const key = s as keyof typeof Network;
  const providerNetwork = Network[key];
  const provider = new Provider(providerNetwork);
  const ansClient = new AnsClient(provider);
  return ansClient;
}

export async function getAnsName(
  address: string,
  network: NetworkName,
): Promise<string | null> {
  const ansClient = getAnsClient(network);
  return await ansClient.getPrimaryNameByAddress(address);
}

export async function getAnsAddress(
  name: string,
  network: NetworkName,
): Promise<string | null> {
  const ansClient = getAnsClient(network);
  return await ansClient.getAddressByName(name);
}
