/**
 * *@author Sabya
    The following code is to create fungible tokens
*/

const {
    TokenCreateTransaction,
    Client,
    TokenType,
    TokenSupplyType,
    TokenInfoQuery,
    AccountBalanceQuery,
    PrivateKey,
    Wallet
} = require("@hashgraph/sdk");

require("dotenv").config({ path: '../.env' });

// Configure account1 as the treasury account
const treasuryAccountId = process.env.ACCOUNT_1_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PVKEY);

//Throw a new error if we were unable to retrieve it.
if (treasuryAccountId == null || treasuryPrivateKey == null) {
    throw new Error("The environment variables treasuryAccountId and treasuryPrivateKey are missing or having issue getting the variables");
}

// Create connection with the Hedera network
const treasuryClient = Client.forTestnet();
treasuryClient.setOperator(treasuryAccountId, treasuryPrivateKey);

// Create wallet for account1
const treasuryUser = new Wallet(
    treasuryAccountId,
    treasuryPrivateKey
)

async function main() {
    //Create the transaction and freeze for manual signing
    console.log(`################################### Generating Token #################################`);

    // Create fungible token
    const transaction = await new TokenCreateTransaction()
        .setTokenName("PowerPay Token")
        .setTokenSymbol("PP")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(treasuryAccountId)
        .setInitialSupply(1000)
        .setMaxSupply(1000)
        .setSupplyType(TokenSupplyType.Finite)
        .setAdminKey(treasuryUser.publicKey)
        .freezeWith(treasuryClient);

    //Sign the transaction with the treasuryClient, who is set as admin and treasury account
    const signTx = await transaction.sign(treasuryPrivateKey);

    //Submit to a Hedera network
    const txResponse = await signTx.execute(treasuryClient);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(treasuryClient);

    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;

    console.log(`- The new token ID is ${tokenId} \n`);
    console.log(`- The new transaction ID is:  ${txResponse.transactionId} \n`);

    const name = await queryTokenFunction("name", tokenId);
    const symbol = await queryTokenFunction("symbol", tokenId);
    const tokenSupply = await queryTokenFunction("totalSupply", tokenId);
    const maxSupply = await queryTokenFunction("maxSupply", tokenId);
    console.log(`- The total supply of the ${name} token is: ${tokenSupply} ${symbol} \n- Maximum supply of ${name} is = ${maxSupply} ${symbol}`);

    // Balance query
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(treasuryUser.accountId);

    //Sign with the treasuryClient operator private key and submit to a Hedera network
    const tokenBalance = await balanceQuery.execute(treasuryClient);

    console.log(`The balance of the user is: ${tokenBalance.tokens.get(tokenId)}`);

    treasuryClient.close()
}

async function queryTokenFunction(functionName, tokenId) {
    //Create the query
    const query = new TokenInfoQuery()
        .setTokenId(tokenId);

    console.log("retrieveing the " + functionName);
    const body = await query.execute(treasuryClient);

    let result;
    if (functionName === "name") {
        result = body.name;
    } else if (functionName === "symbol") {
        result = body.symbol;
    } else if (functionName === "totalSupply") {
        result = body.totalSupply;
    } else if (functionName === "maxSupply") {
        result = body.maxSupply;
    } else {
        return;
    }

    return result
}

// The async function is being called in the top-level scope.
main().catch((error) => {
    console.log(`Error: ${error}`)
    process.exit()
});