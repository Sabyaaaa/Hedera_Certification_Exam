/**
 * @author Sabya
 * This script will create a private topic which will print the time of our submission
 * only authorized user can submit a message to a private topic
 */
const {
    AccountId,
    PrivateKey,
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

//Fetch the account ID and private key of account 1
const myAccountId = process.env.ACCOUNT_1_ID;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PVKEY);

const authorizedAccountId = process.env.ACCOUNT_3_ID;
const authorizedPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_3_PVKEY);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function consensus() {
    // Create a new topic
    let txResponse = await new TopicCreateTransaction()
        .setSubmitKey(myPrivateKey.publicKey)
        .execute(client);

    // Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Create the topic
    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
            console.log(`Received message from topic: ${message}`);
        });

    // Send message to private topic if authorized
    if (authorizedAccountId) {
        const message = new Date().toUTCString();
        let submitMsgTx = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message,
        })
            .freezeWith(client)
            .sign(authorizedPrivateKey);

        let submitMsgTxSubmit = await submitMsgTx.execute(client);
        let getReceipt = await submitMsgTxSubmit.getReceipt(client);

        // Get the status of the transaction
        const transactionStatus = getReceipt.status;
        console.log("The message transaction status: " + transactionStatus.toString());

        console.log("You're authorized to submit message");
        console.log(`Hello, HCS. While writing consensus service message the time is : ${message}`);
    } else {
        console.log("You are not authorized to send messages to this topic.");
    }

    process.exit();
}

// Call the async function
consensus();