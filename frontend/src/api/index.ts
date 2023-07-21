import { AptosClient, Types } from "aptos";
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

export function getAccountResource(
  requestParameters: {
    address: string;
    resourceType: string;
    ledgerVersion?: number;
  },
  nodeUrl: string,
): Promise<Types.MoveResource> {
  const client = new AptosClient(nodeUrl);
  const { address, resourceType, ledgerVersion } = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResource(address, resourceType, {
      ledgerVersion: ledgerVersionBig,
    }),
  );
}

export async function getMemberStatuses(
  tontineAddress: string,
  moduleId: string,
  nodeUrl: string,
): Promise<any> {
  const client = new AptosClient(nodeUrl);
  const payload: Types.ViewRequest = {
    function: `${moduleId}::get_member_statuses`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  const response = await client.view(payload);
  return response[0] as any;
}

export async function getOverallStatus(
  tontineAddress: string,
  moduleId: string,
  nodeUrl: string,
): Promise<any> {
  const client = new AptosClient(nodeUrl);
  const payload: Types.ViewRequest = {
    function: `${moduleId}::get_overall_status`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  const response = await client.view(payload);
  return response[0] as any;
}

export type StakeData = {
  active: number;
  inactive: number;
  pendingInactive: number;
  lockedUntil: number;
};

export async function getStakeData(
  tontineAddress: string,
  moduleId: string,
  nodeUrl: string,
): Promise<StakeData> {
  const client = new AptosClient(nodeUrl);
  const payload: Types.ViewRequest = {
    function: `${moduleId}::get_stake_data`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  const response = await client.view(payload);
  return {
    active: parseInt(response[0] as string),
    inactive: parseInt(response[1] as string),
    pendingInactive: parseInt(response[2] as string),
    lockedUntil: parseInt(response[3] as string),
  };
}

export async function getAnsName(
  address: string,
  network: NetworkName,
): Promise<string | undefined> {
  /* use this once the AnsClient is exposed
  // https://stackoverflow.com/a/42623905/3846032
  const s = network as string;
  const key = s as keyof typeof Network;
  const providerNetwork = Network[key];
  const provider = new Provider(providerNetwork);
  const ansClient = new AnsClient(provider);
  client.getPrimaryNameByAddress
  */
  const response = await fetch(
    `https://www.aptosnames.com/api/${network}/v1/primary-name/${address}`,
  );
  const data = await response.json();
  return data.name;
}

export async function getAnsAddress(
  name: string,
  network: NetworkName,
): Promise<string | undefined> {
  const response = await fetch(
    `https://www.aptosnames.com/api/${network}/v1/address/${name}`,
  );
  const data = await response.json();
  return data.name;
}
