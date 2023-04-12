/**
    *@author Sabya
    *@description This code does the following:
    * Create a new wallet with an initial balance of 20 Hbar
    * 3 keys (Account1, Account2 and Account3) in a key list with a key threshold of 2
    * Create transaction to transfer 10 Hbar to Account4 and sign it with Account1
    * w create a new transaction where Account1 and Account2 sign the transaction
*/
const {
    Wallet,
    LocalProvider,
    AccountId,
    PrivateKey,
    KeyList,
    AccountCreateTransaction,
    Hbar,
    AccountBalanceQuery,
    TransferTransaction,
    ScheduleSignTransaction,
    ScheduleInfoQuery,
    TransactionRecordQuery,
    PublicKey,
} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

/**
 * @typedef {import("@hashgraph/sdk").AccountBalance} AccountBalance
 * @typedef {import("@hashgraph/sdk").AccountId} AccountId
 */

// Fetch the keys and ID from .env file
const accountId1 = AccountId.fromString(process.env.ACCOUNT_1_ID);
const privateKey1 = PrivateKey.fromString(process.env.ACCOUNT_1_PVKEY);
const publicKey1 = PublicKey.fromString(process.env.ACCOUNT_1_PBKEY);
const accountId2 = AccountId.fromString(process.env.ACCOUNT_2_ID);
const privateKey2 = PrivateKey.fromString(process.env.ACCOUNT_2_PVKEY);
const publicKey2 = PublicKey.fromString(process.env.ACCOUNT_2_PBKEY);
const accountId3 = AccountId.fromString(process.env.ACCOUNT_3_ID);
const privateKey3 = PrivateKey.fromString(process.env.ACCOUNT_3_PVKEY);
const publicKey3 = PublicKey.fromString(process.env.ACCOUNT_3_PBKEY);
const accountId4 = AccountId.fromString(process.env.ACCOUNT_4_ID);
const privateKey4 = PrivateKey.fromString(process.env.ACCOUNT_4_PVKEY);

//Validating keys from .env file
if (accountId1 == null || privateKey1 == null) {
    throw new Error("Please check .env file");
}
if (accountId2 == null || privateKey2 == null) {
    throw new Error("Please check .env file");
}
if (accountId3 == null || privateKey3 == null) {
    throw new Error("Please check .env file");
}
if (accountId4 == null || privateKey4 == null) {
    throw new Error("Please check .env file");
}

async function main() {

    // Create wallet for account-4
    const wallet = new Wallet(accountId4, privateKey4, new LocalProvider());

    // generate a key list with 3 keys and a threshold of 2 keys
    const publicKeyList = [];
    publicKeyList.push(publicKey1);
    publicKeyList.push(publicKey2);
    publicKeyList.push(publicKey3);

    const privateKeyList = [];
    privateKeyList.push(privateKey1);
    privateKeyList.push(privateKey2);
    privateKeyList.push(privateKey3);
    const thresholdKey = new KeyList(publicKeyList, 3);

    // create multi-sig account
    // Transfer
    let transaction = await new AccountCreateTransaction()
        .setKey(thresholdKey)
        .setInitialBalance(new Hbar(20))
        .setAccountMemo("2-of-3 multi-sig account4")
        .freezeWithSigner(wallet);
    transaction = await transaction.signWithSigner(wallet);
    const txAccountCreate = await transaction.executeWithSigner(wallet);

    const txAccountCreateReceipt = await txAccountCreate.getReceiptWithSigner(wallet);
    const multiSigAccountId = txAccountCreateReceipt.accountId;
    console.log(`2-of-3 multi-sig account ID:  ${multiSigAccountId.toString()}`
    );
    await queryBalance(multiSigAccountId, wallet);

    // schedule transfer from multi-sig account to operator account
    const txSchedule = await (
        await (
            await (
                await new TransferTransaction()
                    .addHbarTransfer(multiSigAccountId, new Hbar(-10))
                    .addHbarTransfer(
                        wallet.getAccountId(),
                        new Hbar(10)
                    )
                    .schedule() // create schedule
                    .freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).sign(privateKeyList[0])
    ).executeWithSigner(wallet); // add 1. account signature

    const txScheduleReceipt = await txSchedule.getReceiptWithSigner(wallet);
    console.log("Schedule status: " + txScheduleReceipt.status.toString());

    // Grab schedule Id
    const scheduleId = txScheduleReceipt.scheduleId;
    console.log(`Schedule ID:  ${scheduleId.toString()}`);
    const scheduledTxId = txScheduleReceipt.scheduledTransactionId;
    console.log(`Scheduled tx ID:  ${scheduledTxId.toString()}`);

    // add 2. Signature
    const txScheduleSign1 = await (
        await (
            await (
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).sign(privateKeyList[1])
    ).executeWithSigner(wallet);

    const txScheduleSign1Receipt = await txScheduleSign1.getReceiptWithSigner(
        wallet
    );
    console.log(
        "1. ScheduleSignTransaction status: " +
        txScheduleSign1Receipt.status.toString()
    );
    await queryBalance(multiSigAccountId, wallet);

    // add 3. Trigger scheduled txn using signature
    const txScheduleSign2 = await (
        await (
            await (
                await new ScheduleSignTransaction()
                    .setScheduleId(scheduleId)
                    .freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).sign(privateKeyList[2])
    ).executeWithSigner(wallet);

    const txScheduleSign2Receipt = await txScheduleSign2.getReceiptWithSigner(
        wallet
    );
    console.log(
        "2. ScheduleSignTransaction status: " +
        txScheduleSign2Receipt.status.toString()
    );
    await queryBalance(multiSigAccountId, wallet);

}

/**
 * @param {AccountId} accountId
 * @param {Wallet} wallet
 * @returns {Promise<AccountBalance>}
 */
async function queryBalance(accountId, wallet) {
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .executeWithSigner(wallet);
    console.log(
        `Balance of account ${accountId.toString()}: ${accountBalance} Hbar`
    );
    return accountBalance;
}

// Call async function at top level scope
void main();