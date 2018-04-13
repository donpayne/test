'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const mocks = require('node-mocks-http');
const events = require('events');
const rewire = require('rewire');

function spy(fn) {
    return typeof fn === 'function' ? sinon.spy(fn) : sinon.spy(val => val);
}

describe('controller tests', () => {
    let controller;
    let reqMock;
    let resMock;

    beforeEach(() => {
        controller = rewire('../lib/controller');
        controller.__set__('service', {
            swapi: spy(async () => {})
        });
        reqMock = mocks.createRequest();
        resMock = mocks.createResponse({ eventEmitter: events.EventEmitter });
    });

    it('controller should return object methods', done => {
        expect(controller).to.be.an('object');
        expect(controller).to.have.property('getData');
        expect(controller.getData).to.be.instanceof(Function);
        done();
    });

    it('getData should resolve', done => {
        let service = controller.__get__('service');

        reqMock = mocks.createRequest({ params: { resource: 'people' } });
        resMock.on('end', () => {
            expect(service.swapi.called).to.be.true;
            expect(resMock._getStatusCode()).to.equal(200);
            done();
        });

        controller.getData(reqMock, resMock);
    });

    it('getData should reject', done => {
        controller.__set__('service', {
            swapi: spy(async () => {
                throw new Error('some error');
            })
        });
        let service = controller.__get__('service');

        reqMock = mocks.createRequest({ params: { resource: 'people' } });
        resMock.on('end', () => {
            expect(service.swapi.called).to.be.true;
            expect(resMock._getStatusCode()).to.equal(500);
            expect(resMock._getData()).to.equal('some error');
            done();
        });

        controller.getData(reqMock, resMock);
    });
});
