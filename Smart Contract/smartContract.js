/** 
    *@author Sabya
    * Description: This script will use to create smart-contract id and print results of defined functions consisted within smart-contract.
 */

const {
    Client, ContractDeleteTransaction,
    PrivateKey, ContractCreateFlow, ContractExecuteTransaction,
    ContractFunctionParameters } = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

// Fetch Account1_id and Account1 private key from .env file
const myAccountId = process.env.ACCOUNT_1_ID;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PVKEY);

//Import web3.js library
const Web3 = require('web3');
const web3 = new Web3;

let contractCompiled = require("./CertificationC1.json");
const bytecode = contractCompiled.bytecode;
let contractId;
const abi = contractCompiled.abi;

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function createContractID() {
    //Create the transaction
    const contractCreate = new ContractCreateFlow()
        .setGas(100000)
        .setAdminKey(myPrivateKey)
        .setBytecode(bytecode);

    //Sign the transaction with the client operator key and submit to a Hedera network
    const txResponse = contractCreate.execute(client);

    //Get the receipt of the transaction
    const receipt = (await txResponse).getReceipt(client);

    //Get the new contract ID
    contractId = (await receipt).contractId;

    console.log(`The new contract ID is ${contractId} \n`);
}

async function deleteSmartContract() {
    //Create the transaction
    const transaction = await new ContractDeleteTransaction()
        .setContractId(contractId)
        .setTransferAccountId(myAccountId)// required
        .freezeWith(client);

    //Sign with the admin key on the contract
    const signTx = await transaction.sign(myPrivateKey)

    //Sign the transaction with the client operator's private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`The contract deletion consensus status is ${transactionStatus.toString()} \n`);

}

// Define printFunction1() to print function1 result
async function printFunction1(num1, num2) {
    console.log(`############# Calling printFunction1() ################### \n`);
    const tx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
            "function1",
            new ContractFunctionParameters().addUint16(num1).addUint16(num2)
        )
        .execute(client);

    let record = await tx.getRecord(client);
    let func1ResultAsBytes = record.contractFunctionResult.bytes;

    let decodedResult = await decodeFunctionResult("function1", func1ResultAsBytes);
    return decodedResult.result;
}

// Define decodeFunctionResult() to decode function
function decodeFunctionResult(functionName, resultAsBytes) {
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
    const result = web3.eth.abi.decodeParameters(functionParameters, resultHex);
    return result;
}

async function main() {
    // create contract id
    await createContractID();

    // print result
    let result = await printFunction1(5, 6);
    console.log(`Recieved answer from function 1 is ${result} \n`);

    // delete contract
    await deleteSmartContract();

    process.exit();
}

main().catch((error) => {
    console.log(`Error: ${error}`)
    process.exit()
});