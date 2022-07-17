/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { EnergyContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('EnergyContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new EnergyContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"kwh":"100","timeOfManufacture":"02-45","dateOfManufacture":"20-06-2022","manufactureName":"prosumerA1","assetType":"energy"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"kwh":"100","timeOfManufacture":"02-45","dateOfManufacture":"20-06-2022","manufactureName":"prosumerA1","assetType":"energy"}'));

        ctx.clientIdentity = {
            getMSPID: function(){
                return 'prosumer-denergy-com';
            }
        }
    });

    describe('#energyExists', () => {

        it('should return true for a energy', async () => {
            await contract.energyExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a energy that does not exist', async () => {
            await contract.energyExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#readEnergy', () => {

        it('should return a energy', async () => {
            await contract.readEnergy(ctx, '1001').should.eventually.deep.equal({kwh:'100', timeOfManufacture:'02-45', dateOfManufacture:'20-06-2022', manufactureName:'prosumerA1', assetType:'energy'});
        });

        it('should throw an error for a energy that does not exist', async () => {
            await contract.readEnergy(ctx, '1003').should.be.rejectedWith(/The energy 1003 does not exist/);
        });

    });

    describe('#deleteEnergy', () => {

        it('should delete a energy', async () => {
            await contract.deleteEnergy(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a energy that does not exist', async () => {
            await contract.deleteEnergy(ctx, '1003').should.be.rejectedWith(/The energy 1003 does not exist/);
        });

    });

});
