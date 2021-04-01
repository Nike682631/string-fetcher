import {
  BeaconEvent,
  BeaconBaseMessage,
  DAppClient,
  PermissionScope,
  PermissionResponseOutput,
  PartialTezosTransactionOperation,
  OperationResponseOutput,
  AccountInfo,
  defaultEventCallbacks,
  NetworkType,
  TezosOperationType,
  TezosTransactionOperation,
} from "@airgap/beacon-sdk";

export const client = new DAppClient({
  name: "String-fetcher",
  preferredNetwork: NetworkType.EDONET,
});

export async function connect() {
  const activeAccount = await client.getActiveAccount();
  if (activeAccount) return activeAccount;

  return;
}

export async function send(operation: PartialTezosTransactionOperation) {
  const activeAccount = await client.getActiveAccount();
  if (!activeAccount) {
    await client.requestPermissions({
      network: {
        type: NetworkType.EDONET,
      },
    });
  }

  client
    .requestOperation({
      operationDetails: [operation],
    })
    .then((response: OperationResponseOutput) => {
      console.log("transaction hash", response.transactionHash);
    })
    .catch((operationError: BeaconBaseMessage) =>
      console.error(operationError)
    );
}
