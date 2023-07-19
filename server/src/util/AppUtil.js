
'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

exports.buildCCPOrg1 = () => {
    // load the common connection configuration file
    const ccpPath = path.resolve(config.testNetwork.dirName, config.org1.connection);
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(contents);
    return ccp;
};

exports.buildCCPOrg2 = () => {
    // load the common connection configuration file
    const ccpPath = path.resolve(config.testNetwork.dirName, config.org2.connection);
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(contents);
    return ccp;
};

exports.buildWallet = async (Wallets, walletPath) => {
    // Create a new  wallet : Note that wallet is for managing identities. 
    if (walletPath) {
        return await Wallets.newFileSystemWallet(walletPath);
    } else {
        return await Wallets.newInMemoryWallet();
    }
};

exports.prettyJSONString = (inputString) => {
    if (inputString) {
        return JSON.stringify(JSON.parse(inputString), null, 2);
    } else {
        return inputString;
    }
}