require('./utils/should');

var LDGRIssuer = artifacts.require('LDGRIssuer');
var LDGRToken = artifacts.require('LDGRToken');

contract('LDGRToken - Permissions', function(accounts) {
  var issuer = accounts[0];
  var transferAgent = accounts[1];
  var someInvestor = accounts[2];
  var someOtherInvestor = accounts[3];

  var deployedIssuer;
  var issuerName = 'Fake News Inc.';
  const stateFileNumber = '1234filing';
  const stateOfIncorporation = 'CA';
  const physicalAddressOfOperation = '123 Fake St., Los Angeles, CA 90210';

  var deployedToken;
  var tokenName = 'FakeNewsToken';
  var tokenSymbol = 'FKN';
  var tokenIssuanceNumber = 1;

  beforeEach(function() {
    return LDGRIssuer.new(
      issuer,
      transferAgent,
      issuerName,
      stateFileNumber,
      stateOfIncorporation,
      physicalAddressOfOperation
    ).then(function(issuerInstance) {
      deployedIssuer = issuerInstance;
      return LDGRToken.new(
        deployedIssuer.address,
        tokenName,
        tokenSymbol,
        tokenIssuanceNumber
      );
    }).then(function(tokenInstance) {
      deployedToken = tokenInstance;
      return deployedToken.mint(someInvestor, 99999, { from: transferAgent });
    });
  });

  describe('#transferFrom', function() {
    describe('onlyIssuerTransferAgent', function() {
      const transferFromShouldBeRejected = function(from) {
        return deployedToken
          .transferFrom(someInvestor, someOtherInvestor, 999, { from })
          .should.be.rejected;
      };

      context("when called by issuer's transferAgent", function() {
        it('should succeed', function() {
          return deployedToken
            .transferFrom(someInvestor, someOtherInvestor, 999, { from: transferAgent })
            .should.be.fulfilled;
        });
      });

      context('when called by issuer', function() {
        it('should fail', function() {
          return transferFromShouldBeRejected(issuer);
        });
      });

      context('when called by some guy', function() {
        it('should fail', function() {
          return transferFromShouldBeRejected(someInvestor);
        });
      });
    });
  });

  describe('#mint', function() {
    describe('onlyIssuerTransferAgent', function() {
      const mintShouldBeRejected = function(from) {
        return deployedToken
          .mint(someInvestor, 999, { from })
          .should.be.rejected;
      };

      context("when called by issuer's transferAgent", function() {
        it('should succeed', function() {
          return deployedToken
            .mint(someInvestor, 999, { from: transferAgent })
            .should.be.fulfilled;
        });
      });

      context('when called by issuer', function() {
        it('should fail', function() {
          return mintShouldBeRejected(issuer);
        });
      });

      context('when called by some guy', function() {
        it('should fail', function() {
          return mintShouldBeRejected(someInvestor);
        });
      });
    });
  });

  describe('#burnFrom', function() {
    describe('onlyIssuerTransferAgent', function() {
      const burnFromShouldBeRejected = function(from) {
        return deployedToken
          .burnFrom(someInvestor, 999, { from })
          .should.be.rejected;
      };

      context("when called by issuer's transferAgent", function() {
        it('should succeed', function() {
          return deployedToken
            .burnFrom(someInvestor, 999, { from: transferAgent })
            .should.be.fulfilled;
        });
      });

      context('when called by issuer', function() {
        it('should fail', function() {
          return burnFromShouldBeRejected(issuer);
        });
      });

      context('when called by some guy', function() {
        it('should fail', function() {
          return burnFromShouldBeRejected(someInvestor);
        });
      });
    });
  });
});