require('./utils/should');
var getEventsByName = require('./utils/get_events_by_name');

var LDGRIssuer = artifacts.require('LDGRIssuer');
var LDGRSecurity = artifacts.require('LDGRSecurity');
var LDGRToken = artifacts.require('LDGRToken');

contract('LDGRSecurity', function(accounts) {
  var issuer = accounts[0];
  var transferAgent = accounts[1];

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

  describe('#new', function() {
    it('should require issuer, name, and symbol', function() {
      return LDGRSecurity.new().should.be.rejected;
    });

    it('should set token to an address', function() {
      return deployedSecurity.token.call()
        .should.not.eventually.equal('0x0000000000000000000000000000000000000000');
    });

    it('should deploy contract code to the token address', function() {
      return deployedSecurity.token.call()
        .then(function(token) {
          return LDGRToken.at(token).should.be.fulfilled;
        });
    });

    it('should push the token address to address[] tokens', function() {
      return deployedSecurity.token.call()
        .then(function(token) {
          return deployedSecurity.getAllTokens.call().then(function(allTokens) {
            allTokens[0].should.equal(token);
          });
        });
    });

    it('should emit the CreateToken event with correct address newToken', function() {
      return deployedSecurity.token.call()
        .then(function(token) {
          return getEventsByName(deployedSecurity, 'CreateToken').then(function(events) {
            return events[0].args.newToken.should.equal(token);
          });
        });
    });
  });

  describe('#createToken', function() {
    var result;
    var token;

    beforeEach(function() {
      return deployedSecurity
        .createToken(1, { from: transferAgent })
        .then(function(res) {
          result = res;
          return LDGRToken.at(res.logs[0].args.newToken)
            .then(function(t) {
              token = t;
            });
        });
    });

    var getToken = function() {
      return LDGRToken.at(result.logs[0].args.newToken);
    };

    it('should emit the CreateToken event', function() {
      return result.logs[0].event.should.equal('CreateToken');
    });

    it('should deploy contract code to the newToken address', function() {
      return getToken().should.be.fulfilled;
    });

    it('should push the newToken address to address[] tokens', function() {
      return deployedSecurity.getAllTokens().should.eventually.include(token.address);
    });

    it('should set newToken.issuer to issuer', function() {
      return token.issuer.call().should.eventually.equal(deployedIssuer.address);
    });

    it('should set newToken.name to name', function() {
      return token.name.call().should.eventually.equal(securityName);
    });

    it('should set newToken.symbol to symbol', function() {
      return token.symbol.call().should.eventually.equal(securitySymbol);
    });
  });
});