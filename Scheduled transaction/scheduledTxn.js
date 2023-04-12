/**
 * @author Sabya
 * @version 1.0.0
 * @description scheduled transaction service is handling below functionalities:
 * 1. create schedule transaction 
 * 2. delete the schedule transaction
 * 3. get scheduled transaction information
 */

const {
    AccountId, Client, Hbar, ScheduleId, ScheduleInfoQuery, Timestamp,
    PrivateKey, TransferTransaction, ScheduleCreateTransaction, ScheduleDeleteTransaction, Transaction
} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

// Define main function to call requisite function
async function main() {
    const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

    // Fetch keys and ID for accounts
    const account1AccountId = AccountId.fromString(process.env.ACCOUNT_1_ID);
    const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_2_PVKEY);
    const account2AccountId = AccountId.fromString(process.env.ACCOUNT_2_ID);
    const account2PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_2_PVKEY);

    // create connection with hedera network
    const myClient = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

    // transferring 2 Hbars from account1 to account2 and then creating schedule 
    let result = await createSchedule(account1AccountId, account2AccountId, myClient, myPrivateKey, "Scheduled Transaction By Sabya");
    console.info('scheduleId: ' + result.scheduleId);

    // Delete schedule 
    let scheduleDeleteStatus = await deleteSchedule(result.scheduleId, myClient, myPrivateKey);
    console.info('schedule transaction delete status: ' + scheduleDeleteStatus.toString());

    // printing balances of account1
    // console.info('account1 Balance = ' + await utils.accountBalanceQuery(myClient, account1AccountId));

    //getting schedule information and transaction proofs 
    await getScheduleInfo(result.scheduleId, myClient);

    // deleting schedule 
    let executeScheduledTx = await executeScheduled(myAccountId, myClient, myPrivateKey);
    console.info('schedule transaction delete status: ' + executeScheduledTx.toString());

    process.exit();
}

async function createSchedule(fromAccountId, toAccountId, treasuryAccountClient, treasuryAccountPrivateKey, scheduleMemo) {
    console.info("---------------------------- scheduled_transaction_service ---------------------------- ");

    // Create a transaction to schedule
    const transferTx = new TransferTransaction()
        .addHbarTransfer(fromAccountId, new Hbar(-2))//setting 2 Hbar to transfer
        .addHbarTransfer(toAccountId, new Hbar(2));//new Hbar(2)

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transferTx)
        .setScheduleMemo(scheduleMemo)
        .setAdminKey(treasuryAccountPrivateKey)
        .execute(treasuryAccountClient);

    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(treasuryAccountClient);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.info("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.info("The scheduled transaction ID is " + scheduledTxId);

    let result = { 'scheduledTxId': scheduledTxId.toString(), 'scheduleId': scheduleId.toString(), }
    // returning scheduleId
    return result;

}

async function deleteSchedule(scheduleId, treasuryAccountClient, treasuryAccountPrivateKey) {
    console.info("-------------------- scheduled_transaction_service  ---------------------  ");

    //Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(treasuryAccountClient)
        .sign(treasuryAccountPrivateKey);

    //Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(treasuryAccountClient);

    //Get the transaction receipt
    const receipt = await txResponse.getReceipt(treasuryAccountClient);

    //Get the transaction status
    const transactionStatus = receipt.status;

    //returning tranasaction status
    return transactionStatus.toString();
}

async function getScheduleInfo(scheduleId, treasuryAccountClient) {
    console.info(" ----------------------- scheduled_transaction_service ---------------------------  ");

    //Create the query
    const query = new ScheduleInfoQuery().setScheduleId(scheduleId);

    //Sign with the client operator private key and submit the query request to a node in a Hedera network
    const info = await query.execute(treasuryAccountClient);
    console.log("ScheduledId: ", new ScheduleId(info.scheduleId).toString());
    console.log("Memo: ", info.scheduleMemo);
    console.log("CreatedBy: ", new AccountId(info.creatorAccountId).toString());
    console.log("PayedBy: ", new AccountId(info.payerAccountId).toString());
    console.log("The expiration time: ", new Timestamp(info.expirationTime).toDate());

    if (info.executed == null) {
        console.log("The transaction has not been executed yet.");
    } else {
        console.log("The time of execution of the scheduled tx is: ", new Timestamp(info.executed).toDate());
    }
}


async function executeScheduled(accountId, client, privateKey) {
    console.info("------------------------ scheduled_transaction_service -------------------------  ");
    console.log("Once a transaction has been deleted on the Hedera network, it cannot be executed again. Deletion of a transaction is a permanent action and cannot be reversed.")
    await new Transaction.fromAccountId(accountId).sign(privateKey);

    const executed = await txn.execute(client)

    return executed.getReceipt(client)
}

// invoke the async function
main();