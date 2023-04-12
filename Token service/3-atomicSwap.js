/**
    *@author Sabya
    The following code is to atomic swap transaction 150 token to account2 against 10 hbar
*/

const {
    TransferTransaction,
    Client,
    Wallet,
    AccountBalanceQuery,
    Hbar,
    PrivateKey

} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

// Fetch keys and Id from .env file
const treasuryAccountId = process.env.ACCOUNT_1_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PVKEY);

const recipientId = process.env.ACCOUNT_2_ID;
const recipientPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_2_PVKEY);

const tokenId = process.env.TOKEN_ID;

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null || treasuryPrivateKey == null || recipientId == null || recipientPrivateKey == null) {
    throw new Error("Environment variables ID and keys must not be NULL");
}

//Setting-up the client to interact with Hedera Test Network
const client = Client.forTestnet();
client.setOperator(treasuryAccountId, treasuryPrivateKey);

const recepientWallet = new Wallet(
    recipientId,
    recipientPrivateKey
);

async function main() {

    // Amount of token to be swapped
    var transferTokenAmmount = 150

    // Amount to be swapped
    var transferHbarAmmount = 10
    console.log(`############################################ Swapping ${transferTokenAmmount} Token with ${transferHbarAmmount} Hbar ####################################################`)

    // Atomic swap transfer
    const atomicSwapTx = await new TransferTransaction()
        .addHbarTransfer(recepientWallet.accountId, new Hbar(-transferHbarAmmount))
        .addHbarTransfer(client.operatorAccountId, new Hbar(transferHbarAmmount))
        .addTokenTransfer(tokenId, client.operatorAccountId, -(transferTokenAmmount))
        .addTokenTransfer(tokenId, recepientWallet.accountId, transferTokenAmmount)
        .freezeWith(client);

    //Sign with the sender account private key and recipient private key
    const signTx = await (await atomicSwapTx.sign(treasuryPrivateKey)).sign(recipientPrivateKey);

    //Sign with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Obtain the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`\n- Atomic swap with account2 status: ${transactionStatus} \n`);
    console.log(`Transaction ID: ${txResponse.transactionId} \n`);

    //BALANCE CHECK QUERY
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryAccountId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId} \n`);

    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(recipientId).execute(client);
    console.log(`- Recipient's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId} \n`);

    process.exit();

}
// The async function is being called in the top-level scope.
main().catch((error) => {
    console.log(`Error: ${error}`)
    process.exit()
});