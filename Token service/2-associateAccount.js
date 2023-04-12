/**
   *@author Sabya
  This code is used associate account with token
*/
const {
  Client,
  TokenAssociateTransaction,
  Wallet,
  PrivateKey
} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

// Fetch required Id and keys from .env file
const treasuryAccountId = process.env.ACCOUNT_1_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PVKEY);

const account2Id = process.env.ACCOUNT_2_ID;
const account2PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_2_PVKEY);

const tokenId = process.env.TOKEN_ID;

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null || treasuryPrivateKey == null || account2Id == null || account2PrivateKey == null) {
  throw new Error("Environment variables ID and keys must not be NULL");
}

//Setting-up the client to interact with Hedera Test Network
const client = Client.forTestnet();
client.setOperator(treasuryAccountId, treasuryPrivateKey);


const account2Wallet = new Wallet(
  account2Id,
  account2PrivateKey
);

async function main() {

  //LOG THE TRANSACTION STATUS
  console.log(`########################## Associating account 2 with the token id: ${tokenId} ########################## \n`);

  //Associate account2 with the token
  let associateAccount2Tx = await new TokenAssociateTransaction()
    .setAccountId(account2Wallet.accountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(account2PrivateKey)

  //SUBMIT THE TRANSACTION
  let associateAccount2TxSubmit = await associateAccount2Tx.execute(client);

  //GET THE RECEIPT OF THE TRANSACTION
  let associateAccount2Rx = await associateAccount2TxSubmit.getReceipt(client);

  //LOG THE TRANSACTION STATUS
  console.log(`- Token association with account2: ${associateAccount2Rx.status} \n- - Transaction ID for Token association with account2: ${associateAccount2TxSubmit.transactionId}`);

  process.exit();
}

// The async function is being called in the top-level scope.
main().catch((error) => {
  console.log(`Error: ${error}`)
  process.exit()
});