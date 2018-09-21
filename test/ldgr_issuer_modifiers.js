require('./utils/should');

var LDGRIssuer = artifacts.require('LDGRIssuer');

contract('LDGRIssuer - Permissions', function(accounts) {
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

  describe('#setTransferAgent', function() {
    describe('onlyOwner', function() {
      const setTransferAgentShouldBeRejected = function(from) {
        return deployedInstance
          .setTransferAgent(someGuy, { from })
          .should.be.rejected;
      };

      context('when called by owner', function() {
        it('should succeed', function() {
          return deployedInstance
            .setTransferAgent(someGuy, { from: owner })
            .should.be.fulfilled;
        });
      });

      context('when called by transferAgent', function() {
        it('should fail', function() {
          return setTransferAgentShouldBeRejected(transferAgent);
        });
      });
  
      context('when called by some guy', function() {
        it('should fail', function() {
          return setTransferAgentShouldBeRejected(someGuy);
        });
      });
    });
  });

  describe('#setPhysicalAddressOfOperation', function() {
    describe('onlyOwner', function() {
      const setAddressShouldBeRejected = function(from) {
        return deployedInstance
          .setPhysicalAddressOfOperation('123 other st.', { from })
          .should.be.rejected;
      };

      context('when called by owner', function() {
        it('should succeed', function() {
          return deployedInstance
            .setPhysicalAddressOfOperation('123 other st.', { from: owner })
            .should.be.fulfilled;
        });
      });

      context('when called by transferAgent', function() {
        it('should fail', function() {
          return setAddressShouldBeRejected(transferAgent);
        });
      });
  
      context('when called by some guy', function() {
        it('should fail', function() {
          return setAddressShouldBeRejected(someGuy);
        });
      });
    });
  });

  describe('#createSecurity', function() {
    describe('onlyTransferAgent', function() {
      const createSecurityShouldBeRejected = function(from) {
        return deployedInstance
          .createSecurity('FailureCoin', 'FCN', { from })
          .should.be.rejected;
      };

      context('when called by transferAgent', function() {
        it('should succeed', function() {
          return deployedInstance
            .createSecurity('RealCoin', 'RCN', { from: transferAgent })
            .should.be.fulfilled;
        });
      });

      context('when called by owner', function() {
        it('should fail', function() {
          return createSecurityShouldBeRejected(owner);
        });
      });

      context('when called by some guy', function() {
        it('should fail', function() {
          return createSecurityShouldBeRejected(someGuy);
        });
      });
    });
  });
});