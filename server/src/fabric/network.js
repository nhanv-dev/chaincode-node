
'use strict'

const { buildConnection } = require("../util/CAUtil");

exports.initLedger = async function () {
    try {
        const connection = await buildConnection();
        if (!connection) {
            return { error: 'Build connection failed' };
        }
        const { contract, gateway } = connection;
        if (!contract || !gateway) {
            return { error: 'Build contract and gateway failed' };
        }
        await contract.submitTransaction('initLedger');
        await gateway.disconnect();
        return { message: 'Init Ledger Transaction has been submitted' }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};

exports.insertCar = async function (key, color, size, owner) {
    try {
        const connection = await buildConnection();
        if (!connection) {
            return { error: 'Build connection failed' };
        }
        const { contract, gateway } = connection;
        if (!contract || !gateway) {
            return { error: 'Build contract and gateway failed' };
        }
        await contract.submitTransaction('insertCar', key, color, size, owner);
        await gateway.disconnect();
        return { message: 'Create Car Transaction has been submitted' };
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};

exports.updateCar = async function (key, color, size, owner) {
    try {
        const connection = await buildConnection();
        if (!connection) {
            return { error: 'Build connection failed' };
        }
        const { contract, gateway } = connection;
        if (!contract || !gateway) {
            return { error: 'Build contract and gateway failed' };
        }
        await contract.submitTransaction('updateCar', key, color, size, owner);
        await gateway.disconnect();
        return { mesage: 'Update Car Transaction has been submitted' };
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};

exports.queryAllCars = async function () {
    try {
        const connection = await buildConnection();
        if (!connection) {
            return { error: 'Build connection failed' };
        }
        const { contract, gateway } = connection;
        if (!contract || !gateway) {
            return { error: 'Build contract and gateway failed' };
        }
        const result = await contract.evaluateTransaction('queryAllCars');
        await gateway.disconnect();
        return result;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};

exports.querySingleCar = async function (key) {
    try {
        const connection = await buildConnection();
        if (!connection) {
            return { error: 'Build connection failed' };
        }
        const { contract, gateway } = connection;
        if (!contract || !gateway) {
            return { error: 'Build contract and gateway failed' };
        }
        const result = await contract.evaluateTransaction('querySingleCar', key);
        await gateway.disconnect();
        return result;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return { error: error.message };
    }
};
