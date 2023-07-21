import { AptosClient } from "aptos";

async function submitTransaction(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  fullnodeUrl: string,
  transaction: any,
) {
  console.log("Submitting transaction", JSON.stringify(transaction));
  const pendingTransaction = await signAndSubmitTransaction(transaction);
  const client = new AptosClient(fullnodeUrl);
  await client.waitForTransactionWithResult(pendingTransaction.hash, {
    checkSuccess: true,
  });
}

export async function create(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  description: string,
  invitees: string[],
  checkInFrequencySecs: number,
  claimWindowSecs: number,
  contributionAmountOcta: number,
  fallbackPolicy: number,
  { delegationPool }: { delegationPool?: string } = {},
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::create`,
    type_arguments: [],
    arguments: [
      description,
      invitees,
      checkInFrequencySecs,
      claimWindowSecs,
      contributionAmountOcta,
      fallbackPolicy,
      delegationPool,
    ],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function inviteMember(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
  memberAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::invite_member`,
    type_arguments: [],
    arguments: [tontineAddress, memberAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function removeMember(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
  memberAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::remove_member`,
    type_arguments: [],
    arguments: [tontineAddress, memberAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function contribute(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
  amountInOcta: number,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::contribute`,
    type_arguments: [],
    arguments: [tontineAddress, amountInOcta],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function withdraw(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
  amountInOcta: number,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::withdraw`,
    type_arguments: [],
    arguments: [tontineAddress, amountInOcta],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function leave(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::leave`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function lock(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::lock`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function checkIn(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::check_in`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  console.log("Submitting transaction", JSON.stringify(transaction));
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function claim(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::claim`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}
export async function unlock(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::unlock`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function executeFallback(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::execute_fallback`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function destroy(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  tontineAddress: string,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::destroy`,
    type_arguments: [],
    arguments: [tontineAddress],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}
