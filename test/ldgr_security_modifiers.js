require('./utils/should');

var LDGRIssuer = artifacts.require('LDGRIssuer');
var LDGRSecurity = artifacts.require('LDGRSecurity');

contract('LDGRSecurity - Permissions', function(accounts) {
  var issuer = accounts[0];
  var transferAgent = accounts[1];
  var someGuy = accounts[2];

  var deployedIssuer;
  var issuerName = 'Fake News Inc.';
  const stateFileNumber = '1234filing';
  const stateOfIncorporation = 'CA';
  const physicalAddressOfOperation = '123 Fake St., Los Angeles, CA 90210';

  var deployedSecurity;
  var securityName = 'Beanie Baby';
  var securitySymbol = 'BNBY';

  beforeEach(function() {
    // create address _issuer as deployedIssuer.address
    return LDGRIssuer.new(
      issuer,
      transferAgent,
      issuerName,
      stateFileNumber,
      stateOfIncorporation,
      physicalAddressOfOperation
    ).then(function(instance) {
      deployedIssuer = instance;
      return LDGRSecurity.new(deployedIssuer.address, securityName, securitySymbol);
    }).then(function(securityInstance) {
      deployedSecurity = securityInstance;
    });
  });

  describe('#createToken', function() {
    describe('onlyIssuerTransferAgent', function() {
      var createTokenShouldBeRejected = function(from) {
        return deployedSecurity
          .createToken(1, { from })
          .should.be.rejected;
      };

      context("when called by issuer's transferAgent", function() {
        it('should succeed', function() {
          return deployedSecurity
            .createToken(1, { from: transferAgent })
            .should.be.fulfilled;
        });
      });

      context('when called by issuer', function() {
        it('should fail', function() {
          return createTokenShouldBeRejected(issuer);
        });
      });

      context('when called by some guy', function() {
        it('should fail', function() {
          return createTokenShouldBeRejected(someGuy);
        });
      });
    });
  });
});