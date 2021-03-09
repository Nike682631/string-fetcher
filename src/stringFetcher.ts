import * as fs from "fs";
import * as log from "loglevel";
import fetch from "node-fetch"; //Learn more about fetch at https://developers.google.com/web/ilt/pwa/working-with-the-fetch-api

import { registerFetch, registerLogger } from "conseiljs";
import {
  TezosConseilClient,
  KeyStore,
  Signer,
  TezosMessageUtils,
  TezosNodeReader,
  TezosNodeWriter,
  TezosConstants,
  TezosParameterFormat,
} from "conseiljs";
import { KeyStoreUtils, SoftSigner } from "conseiljs-softsigner";

// const logger = log.getLogger("conseiljs"); // Using the getLogger() method lets you create a separate logger for each part of your application with its own logging level.
// logger.setLevel("debug", false); //This disables all logging below the given level, so that after a log.setLevel("warn") call log.warn("something") or log.error("something") will output messages, but log.info("something") will not.
// //learn more at http://www.lib4dev.in/info/pimterry/loglevel/8976707
// registerLogger(logger); //Used to register logger variable
// registerFetch(fetch); //Used to register fetch

const tezosNode =
  "https://cors-anywhere.herokuapp.com/https://tezos-dev.cryptonomic-infra.tech:443"; //Tezos testnet node
const conseilServer = {
  url:
    "https://cors-anywhere.herokuapp.com/https://conseil-dev.cryptonomic-infra.tech:443", //Conseil testnet node
  apiKey: "6bfc2097-39f8-4020-8a3d-3d9d026e8c8d", //API key
  network: "delphinet",
}; //Tesnet version
const networkBlockTime = 30 + 1;

async function initAccount(account: string): Promise<KeyStore> {
  console.log("~~ initAccount");
  console.log(`loading ${account} faucet file`);
  const faucetAccount = {
    mnemonic: [
      "spare",
      "practice",
      "gloom",
      "uncover",
      "marble",
      "milk",
      "clutch",
      "audit",
      "burst",
      "catch",
      "arrive",
      "ask",
      "hub",
      "fatigue",
      "mail",
    ],
    secret: "7f2a991d6f1802937c2cfd18d793f35c98b7f198",
    amount: "23745748033",
    pkh: "tz1McqiPp8HUVQBWLchBXWR5imC4YmdEW4z3",
    password: "HTnjq6EZJ0",
    email: "egszzdbp.hitolfhz@tezos.example.org",
  };
  const keystore = await KeyStoreUtils.restoreIdentityFromFundraiser(
    faucetAccount.mnemonic.join(" "),
    faucetAccount.email,
    faucetAccount.password,
    faucetAccount.pkh
  );

  return keystore;
}

async function revealAccount(keystore: KeyStore) {
  let signer: Signer = await SoftSigner.createSigner(
    TezosMessageUtils.writeKeyWithHint(keystore.secretKey, "edsk")
  );
  console.log(`~~ revealAccount`);
  if (
    await TezosNodeReader.isManagerKeyRevealedForAccount(
      tezosNode,
      keystore.publicKeyHash
    )
  )
    return;
  const nodeResult = await TezosNodeWriter.sendKeyRevealOperation(
    tezosNode,
    signer,
    keystore
  );
  let groupid = clearRPCOperationGroupHash(nodeResult.operationGroupID);
  console.log(`Injected reveal operation with ${groupid}`);
  const conseilResult = await TezosConseilClient.awaitOperationConfirmation(
    conseilServer,
    conseilServer.network,
    groupid,
    5,
    networkBlockTime
  );
  console.log(`Revealed account at ${conseilResult.source}`);
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
}

async function statOperation(groupid: string) {
  const result = await TezosConseilClient.awaitOperationConfirmation(
    conseilServer,
    conseilServer.network,
    groupid,
    7,
    networkBlockTime
  );

  if (result["status"] === "failed") {
    console.log(
      `${result["kind"]} ${groupid} ${result["status"]} at block ${result["block_level"]}`
    );
  } else if (result["status"] === "applied") {
    let message = `${result["kind"]} ${groupid} included in block ${result["block_level"]} for ${result["consumed_gas"]}g and ${result["paid_storage_size_diff"]}f`;

    if (
      "originated_contracts" in result &&
      result["originated_contracts"] != null &&
      result["originated_contracts"].length > 0
    ) {
      message += ` new contract at ${result["originated_contracts"]}`;
    }

    console.log(message);
  } else {
    console.log(JSON.stringify(result));
  }
}

function clearRPCOperationGroupHash(hash: string) {
  //This operation, and all of the other operations we’ve done, is stored in the “result” variable,
  // which contains a few operation details. Unfortunately, Tezos testnet currently has a problem
  //with returning the operation ID. In order to counter this, we have a function that
  //accepts the ID as an input, and returns the proper ID.

  return hash.replace(/\"/g, "").replace(/\n/, "");
}

async function run(string: string) {
  const originator = "tz1McqiPp8HUVQBWLchBXWR5imC4YmdEW4z3"; //publickeyhash(pkh) of the faucet accounts

  let groupid = "";
  let contractAddress = "";
  let mapid = 0;

  let keystore = await initAccount(originator);
  await revealAccount(keystore);

  let signer: Signer = await SoftSigner.createSigner(
    TezosMessageUtils.writeKeyWithHint(keystore.secretKey, "edsk")
  );

  TezosNodeWriter.sendContractInvocationOperation(
    tezosNode,
    signer,
    keystore,
    "KT1VQNU7XC1ZUr4GABrdMCfUaw6cXQ91XxWE",
    0,
    50000,
    500,
    30000,
    undefined,
    `"${string}"`,
    TezosParameterFormat.Michelson
  );
}

export default run;
