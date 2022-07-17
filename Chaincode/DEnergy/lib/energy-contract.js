/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class EnergyContract extends Contract {
    
    async energyExists(ctx, energyId) {
        const buffer = await ctx.stub.getState(energyId);
        return (!!buffer && buffer.length > 0);
    }

    async readEnergy(ctx, energyId) {
        const exists = await this.energyExists(ctx, energyId);
        if (!exists) {
            throw new Error(`The energy ${energyId} does not exist`);
        }
        const buffer = await ctx.stub.getState(energyId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async calculateBalanceEnergy(ctx, value, addOrSub){
        const asset = await this.readEnergy(ctx, "Energy-000");
        var x = Number(asset["kwh"]);
        if(addOrSub === 'add'){
            // Adds Energy
            x = (x+Number(value));
        }else if(addOrSub === 'sub'){
            // Subtracts Energy
            x = (Number(value)-x);
        }
        x = Math.abs(x);
        return (x);

    }

    async createBalanceEnergy(ctx, kwh) {
        const mspID = ctx.clientIdentity.getMSPID();
        if( mspID === 'archon-denergy-com'){
            const exists = await this.energyExists(ctx, "Energy-000");
            if (exists) {
                throw new Error(`The energyID : Energy-000 already exists`);
            }
            const energyAsset = {kwh, assetType:'balance-energy'}; 
            const buffer = Buffer.from(JSON.stringify(energyAsset));
            await ctx.stub.putState("Energy-000", buffer);
        }
        else{
            return (`User under following MSP: ${mspID} cannot able to perform this action`);
        }
       
    }

    async deleteEnergy(ctx, energyId) {
            const exists = await this.energyExists(ctx, energyId);
            if (!exists) {
                throw new Error(`Unable to delete energy : ${energyId}, because : The energy ${energyId} does not exist`);
            }
            await ctx.stub.deleteState(energyId);
    }
    
    async updateBalanceEnergy(ctx, newValue){
            const exists = await this.energyExists(ctx, "Energy-000");
            if (!exists) {
                throw new Error(`The energyID Energy-000 does not exists`);
            }
            await this.deleteEnergy(ctx, "Energy-000");
            const energyAsset = {kwh:newValue, assetType:'balance-energy'}; 
            const buffer = Buffer.from(JSON.stringify(energyAsset));
            await ctx.stub.putState("Energy-000", buffer);
    }

    async createEnergy(ctx, energyId, kwh, timeOfManufacture, dateOfManufacture, manufactureName) {
        const mspID = ctx.clientIdentity.getMSPID();
        if( mspID === 'prosumer-denergy-com' || mspID === 'producer-denergy-com'){

            const exists = await this.energyExists(ctx, energyId);
            if (exists) {
                throw new Error(`The energy ${energyId} already exists`);
            }
            const energyAsset = {kwh, timeOfManufacture, dateOfManufacture, manufactureName, assetType:'energy'}; 
            const buffer = Buffer.from(JSON.stringify(energyAsset));
            await ctx.stub.putState(energyId, buffer);
            // Code to add newly created energy to balance energy
            const newValue = await this.calculateBalanceEnergy(ctx, kwh, 'add');
            await this.updateBalanceEnergy(ctx, newValue);
            return (`Balance Energy Available is : ${newValue}`);
        }
        else{
            return (`User under following MSP: ${mspID} cannot able to perform this action`);
        }
       
    }

    async orderExists(ctx, orderId) {
        const buffer = await ctx.stub.getState(orderId);
        return (!!buffer && buffer.length > 0);          
    }

    async createOrder(ctx, orderId, kwh) {
        const mspID = ctx.clientIdentity.getMSPID();
        if( mspID === 'consumer-denergy-com' || mspID === 'prosumer-denergy-com'){
            const exists = await this.orderExists(ctx, orderId);
            if (exists) {
                throw new Error(`The asset order ${orderId} already exists`);
            }
    
            const orderAsset = {kwh, orderStatus:'pending', assetType:'order'};
            const buffer = Buffer.from(JSON.stringify(orderAsset));
            await ctx.stub.putState(orderId, buffer);
            
        }
        else{
            return (`Under following MSP: ${mspID} cannot able to perform this action`);
        }
       
    }

    async readOrder(ctx, orderId) {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        const buffer = await ctx.stub.getState(orderId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async deleteOrder(ctx, orderId) {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        await ctx.stub.deleteState(orderId);
    }
    
    async matchOrder(ctx, orderId){
        const mspID = ctx.clientIdentity.getMSPID();
        if( mspID === 'archon-denergy-com'){
            var bEnergy = await this.calculateBalanceEnergy(ctx, "0","add");
            const asset = await this.readOrder(ctx, orderId);
            var num = Number(asset["kwh"]);
            if(bEnergy>=num){
                bEnergy = await this.calculateBalanceEnergy(ctx, num, 'sub');
                await this.updateBalanceEnergy(ctx, bEnergy);
                //Delete Order 
                await this.deleteOrder(ctx, orderId);
                //Creates New Order as orderStatus: placed 
                const orderAsset = {kwh:num, orderStatus:'placed', assetType:'order'};
                const buffer = Buffer.from(JSON.stringify(orderAsset));
                await ctx.stub.putState(orderId, buffer);
                //True Condition Output
                return (`Order Placed Successfully`);
            }
            else{
                //False Condition Output
                return (`No Sufficient Energy Available`);
            }
        }else{
            return(`Under following MSP: ${mspID} cannot able to perform this action`);
        }  
    }   

    async queryAllEnergy(ctx) {
        const queryString = {
            selector: {
                assetType: 'energy',
            },
            sort: [{ dateOfManufacture: 'asc' }],
        };
        let resultIterator = await ctx.stub.getQueryResult(
            JSON.stringify(queryString)
        );
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }

    async getEnergyByRange(ctx, startKey, endKey) {
        let resultIterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }

    async getEnergyWithPagination(ctx, _pageSize, _bookmark) {
        const queryString = {
            selector: {
                assetType: 'energy',
            },
        };
        const pageSize = parseInt(_pageSize, 10);
        const bookmark = _bookmark;

        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
            JSON.stringify(queryString),
            pageSize,
            bookmark
        );

        const result = await this.getAllResults(iterator, false);

        const results = {};
        results.Result = result;
        results.ResponseMetaData = {
            RecordCount: metadata.fetched_records_count,
            Bookmark: metadata.bookmark,
        };
        return JSON.stringify(results);
    }

    async getEnergysHistory(ctx, energyId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(energyId);
        let results = await this.getAllResults(resultsIterator, true);
        return JSON.stringify(results);
    }

    async getAllResults(iterator, isHistory) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.timestamp = res.value.timestamp;
                    jsonRes.Value = JSON.parse(res.value.value.toString());
                } else {
                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    }
}

module.exports = EnergyContract;
