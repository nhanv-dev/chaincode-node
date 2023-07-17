
'use strict'

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const { buildCCPOrg1, buildWallet } = require('../util/AppUtil');
const { buildCAClient, enrollAdmin, registerAndEnrollUser, enrollUser } = require('../util/CAUtil');

const path = require('path');

// const realNetwork = '/home/nhan/go/src/github.com/nhanv-dev/fabric-samples/test-network';
const channelName = 'mychannel';
const chaincodeName = 'basic';
const userName = 'admin';
const mspOrg1 = 'Org1MSP';
const org1UserId = 'javascriptAppUser';

const walletPath = path.join('/home/nhan/go/src/github.com/nhanv-dev/chaincode-node/server', 'wallet');

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {

    try {
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        const wallet = await buildWallet(Wallets, walletPath);

        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true }
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        return { contract, wallet, caClient }
    } catch (error) {
        console.log(error);
    }
}


exports.initLedger = async function () {
    try {
        const { contract } = await main();
        await contract.submitTransaction('initLedger');
        return { message: 'Init Ledger' }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};

exports.queryAllCars = async function () {
    try {
        const { contract } = await main();
        const result = await contract.evaluateTransaction('queryAllCars');
        console.log(`Result: ${prettyJSONString(result.toString())}`)
        return result;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};

exports.querySingleCar = async function (key) {
    try {
        const { contract } = await main();
        const result = await contract.evaluateTransaction('querySingleCar', key);
        console.log(`Result: ${prettyJSONString(result.toString())}`)
        return result;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};