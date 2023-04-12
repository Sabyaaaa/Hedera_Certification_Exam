/** 
    *@author Sabya
    * This script will create 5 new accounts and query the balances 
*/

const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    Hbar
} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

// function to create 5 new accounts
async function createAccounts() {

    // Grab Hedera developer portal account ID and private key
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If not able to grab it, should throw a new error
    if (myAccountId == null || myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Creating connection to the Hedera Test Network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const accountList = [];  // Array List to store account details
    for (let i = 0; i < 5; i++) {

        // Create new keys
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        // Creating new account with 500 HBar starting balance
        const newAcc = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(new Hbar(500))
            .execute(client);

        // Get the new account ID
        const getReceipt = await newAcc.getReceipt(client);
        const newAccountId = getReceipt.accountId;

        console.info(`#<----------------------- ACCOUNT_${i + 1} CREDENTIAL ---------------------------->`);
        console.log(`ACCOUNT_${i + 1}_ID=${newAccountId} \n`);
        console.log(`ACCOUNT_${i + 1}_PBKEY=${newAccountPublicKey} \n`);
        console.log(`ACCOUNT_${i + 1}_PVKEY=${newAccountPrivateKey} \n`);

        accountList.push(newAccountId);
    }

    // Checking account Balance of all 5 accounts
    for (const newAccountId of accountList) {
        const accountBal = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        console.log("Account " + newAccountId + " balance: " + accountBal.hbars + "Hbar");

        console.log("Account info of account :")
        console.log(JSON.stringify(accountBal));
    }
    client.close()
}

// Call the async function
createAccounts().catch((error) => {
    console.log(`Error: ${error}`)
    process.exit()
});