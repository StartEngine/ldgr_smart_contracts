require('./utils/should');
var getEventsByName = require('./utils/get_events_by_name');

var LDGRIssuer = artifacts.require('LDGRIssuer');
var LDGRSecurity = artifacts.require('LDGRSecurity');

contract('LDGRIssuer', function(accounts) {
  var owner = accounts[0];
  var transferAgent = accounts[1];
  var someGuy = accounts[2];

  var deployedInstance;
  var issuerName = 'Fake News Inc.';
  const stateFileNumber = '1234filing';
  const stateOfIncorporation = 'CA';
  const physicalAddressOfOperation = '123 Fake St., Los Angeles, CA 90210';

  beforeEach(function() {
    return LDGRIssuer.new(
      owner,
      transferAgent,
      issuerName,
      stateFileNumber,
      stateOfIncorporation,
      physicalAddressOfOperation
    ).then(function(instance) {
      deployedInstance = instance;
    });
  });

  describe('#new', function() {
    it('should require initialOwner, initialTransferAgent, name, stateFileNumber, stateOfIncorporation, and physicalAddressOfOperation', function() {
      return LDGRIssuer.new().should.be.rejected;
    });
  });

  describe('#setTransferAgent', function() {
    context('when newTransferAgent is 0', function() {
      it('should fail', function() {
        return deployedInstance
          .setTransferAgent(0, { from: owner })
          .should.be.rejected;
      });
    });

    it('should set a new transferAgent address', function() {
      return deployedInstance
        .setTransferAgent(someGuy, { from: owner })
        .then(function() {
          return deployedInstance.transferAgent.call()
            .should.eventually.equal(someGuy);
        });
    });

    it('should emit the TransferAgentUpdated event', function() {
      return deployedInstance
        .setTransferAgent(someGuy, { from: owner })
        .then(function() {
          return getEventsByName(deployedInstance, 'TransferAgentUpdated').should.be.fulfilled;
        });
    });
  });

  describe('#setPhysicalAddressOfOperation', function() {
    const newAddress = '1800 Hotline Bling, Miami, FL 90210';

    it('should set a new physicalAddressOfOperation', function() {
      return deployedInstance
        .setPhysicalAddressOfOperation(newAddress, { from: owner })
        .then(function() {
          return deployedInstance.physicalAddressOfOperation.call().should.eventually.equal(newAddress);
        });
    });

    it('should emit the PhysicalAddressOfOperationUpdated event', function() {
      return deployedInstance
      .setPhysicalAddressOfOperation(newAddress, { from: owner })
      .then(function() {
        return getEventsByName(deployedInstance, 'PhysicalAddressOfOperationUpdated').should.be.fulfilled;
      });
    });
  });

  describe('#createSecurity', function() {
    var result;

    beforeEach(function() {
      return deployedInstance
        .createSecurity('Preferred Stock', 'STAR', { from: transferAgent })
        .then(function(res) {
          result = res;
        });
    });

    it('should emit the CreateSecurity event', function() {
      return result.logs[0].event.should.equal('CreateSecurity');
    });

    it('should deploy contract code to the newSecurity address', function() {
      var addr = result.logs[0].args.newSecurity;
      return LDGRSecurity.at(addr).should.be.fulfilled;
    });

    it('should add new security to securities array', function() {
      var addr = result.logs[0].args.newSecurity;
      return deployedInstance.getSecurities.call()
        .then(function(securities) {
          return securities.should.include(addr);
        });
    });
  });
});