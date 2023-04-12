# Hedera_Final
This project is a Node.js based application that provides a set of scripts to interact with the Hedera Hashgraph network. The scripts contains various functionalities such as creating new accounts, transferring HBAR, querying account information, creating and managing fungible tokens, multi-signature transactions, consensus, scheduling transactions, and interacting with smart contracts.


## Getting Started 

### Prerequisites


- Node.js (stable (18.15.0) version) 
- Hedera Hashgraph account 

### Installation

- Clone this repository or download the code as a zip file. `git clone https://github.com/Sabyaaaa/Hedera_Certification_Exam.git` 
- Go to the `Hedera_Certification_Exam` directory: `cd Hedera_Certification_Exam` 
- Install dependencies by running `npm install`. 
- Create a `.env` file in the root directory of the project and add your Hedera Hashgraph developer portal account details. 
- Run the scripts by executing `node <file-name>` (replace `<file-name>` with the name of the file you want to execute). 

## Usage

To use this application, you'll need to have Node.js and the @hashgraph/sdk and dotenv modules installed. Once you have those dependencies installed, you can clone this repository and run the scripts using the `node <file name>` command. 

Here are the available scripts: 

### Account Directory

- `cd Accounts` 
- `node createAccount.js`: This will create new accounts


### Token service Directory

- `cd Token service` 
- `node 1-createFT.js`: Creates fungible token 
- `node 2-associateAccount.js`: Associate Token with accounts
- `node 3-atomicSwap`:  atomic swap transaction 150 token to account2 against 10 hbar

### MultiSignature Directory

- `cd MultiSignature`
- `node multiSig.js`: Perform a multi-signature transaction 

### Consensus service Directory 
- `cd Consensus service`
- `node consensusService.js`: creates a private topic and allows authorized user to submit a message to it

### Scheduled Transaction Directory 
- `cd Scheduled transaction`
- `node scheduledTxn.js`: Schedule a transaction 

### Smart Contract Directory 
- `cd Smart Contract`
- `node smartContract.js`: Interact with a smart contract and decode it

## License 

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).