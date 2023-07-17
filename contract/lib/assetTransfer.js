/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async initLedger(ctx) {

        console.info('============= START : Initialize Ledger ===========');

        const assets = [
            {
                ID: 'CAR1',
                Color: 'blue',
                Size: 5,
                Owner: 'Tomoko',
            },
            {
                ID: 'CAR2',
                Color: 'red',
                Size: 5,
                Owner: 'Brad',
            },
            {
                ID: 'CAR3',
                Color: 'green',
                Size: 10,
                Owner: 'Jin Soo',
            },
            {
                ID: 'CAR4',
                Color: 'yellow',
                Size: 10,
                Owner: 'Max',
            },
            {
                ID: 'CAR5',
                Color: 'black',
                Size: 15,
                Owner: 'Adriana',
            },
            {
                ID: 'CAR6',
                Color: 'white',
                Size: 15,
                Owner: 'Michel',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
        }

        console.info('============= END : Initialize Ledger ===========');
    }

    async queryAllCars(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async querySingleCar(ctx, key) {
        console.log('Key is ' + key);
        const res = await ctx.stub.getState(key);
        if (res) {
            console.log('Result is\n' + JSON.parse(res.toString()));
            let Record;
            try {
                Record = JSON.parse(res.toString('utf8'));
            } catch (err) {
                console.log(err);
                Record = res.toString('utf8');
            }
            return JSON.stringify([{ key, Record }]);
        }
        else {
            console.err('Did not find the car with carNo ' + key);
            return [];
        }
    }

}

module.exports = AssetTransfer;
