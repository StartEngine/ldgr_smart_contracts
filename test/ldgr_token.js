require('./utils/should');

var getEventsByName = require('./utils/get_events_by_name');

var LDGRIssuer = artifacts.require('LDGRIssuer');
var LDGRToken = artifacts.require('LDGRToken');

contract('LDGRToken', function(accounts) {
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
    });
  });

  describe('ERC20 standards', function() {
    it('should have a name', function() {
      return deployedToken.name.call().should.eventually.equal(tokenName);
    });

    it('should have a symbol', function() {
      return deployedToken.symbol.call().should.eventually.equal(tokenSymbol);
    });

    it('should have decimals of 0', function() {
      return deployedToken.decimals.call()
        .then(function(decimals) {
          return (decimals.toNumber()).should.equal(0);
        });
    });

    it('should have an initial totalSupply of 0', function() {
      return deployedToken.totalSupply.call()
        .then(function(totalSupply) {
          return (totalSupply.toNumber()).should.equal(0);
        });
    });

    it('should not implement transfer()', function() {
      (function() {
        deployedToken.transfer(someInvestor, 10);
      }).should.throw(TypeError);
    });

    it('should not implement approve()', function() {
      (function() {
        deployedToken.approve(someInvestor, 10);
      }).should.throw(TypeError);
    });
  });

  describe('#mint', function() {
    const mint = function(to, value) {
      return deployedToken.mint(to, value, { from: transferAgent });
    };

    context('when address _to is 0x0', function() {
      it('should fail', function() {
        return mint(0, 1000).should.be.rejected;
      });
    });

    it('should add _value to balanceOf _to', function() {
      const firstGrant = 9483;
      const secondGrant = 547383;
      return mint(someInvestor, firstGrant)
        .then(function() {
          return mint(someInvestor, secondGrant);
        })
        .then(function() {
          return deployedToken.balanceOf.call(someInvestor);
        })
        .then(function(bigNumBalance) {
          const totalTokens = firstGrant + secondGrant;
          return bigNumBalance.toNumber().should.equal(totalTokens);
        });
    });

    it('should add _value to totalSupply', function() {
      const firstGrant = 7493;
      const secondGrant = 64839;
      return mint(someInvestor, firstGrant)
        .then(function() {
          return mint(someOtherInvestor, secondGrant);
        })
        .then(function() {
          return deployedToken.totalSupply.call();
        })
        .then(function(bigNumTotalSupply) {
           const totalTokens = firstGrant + secondGrant;
           return bigNumTotalSupply.toNumber().should.equal(totalTokens);
        });
    });

    // it('should emit the Mint event with the correct address _to', function() {
    //   return mint(someInvestor, 10)
    //     .then(function() {
    //       return getEventsByName(deployedToken, 'Mint');
    //     })
    //     .then(function(events) {
    //       return events[0].args.to.should.equal(someInvestor);
    //     });
    // });

    // it('should emit the Mint event with the correct amount _value', function() {
    //   const tokenAmount = 84739;
    //   return mint(someInvestor, tokenAmount)
    //     .then(function() {
    //       return getEventsByName(deployedToken, 'Mint')
    //     })
    //     .then(function(events) {
    //       return events[0].args.value.toNumber().should.equal(tokenAmount);
    //     });
    // });

    it('should emit the Transfer event with _from = 0x0, _to, and _value', function() {
      const tokenAmount = 84739;
      return mint(someInvestor, tokenAmount)
        .then(function() {
          return getEventsByName(deployedToken, 'Transfer')
        })
        .then(function(events) {
          const args = events[0].args;
          args.from.should.equal('0x0000000000000000000000000000000000000000');
          args.to.should.equal(someInvestor);
          args.value.toNumber().should.equal(tokenAmount);
        });
    });
  });

  describe('#burnFrom', function() {
    const initialBalance = 99999;

    beforeEach(function() {
      return deployedToken.mint(someInvestor, initialBalance, { from: transferAgent });
    });

    const burnFrom = function(who, value) {
      return deployedToken.burnFrom(who, value, { from: transferAgent });
    };

    context('when _value is greater than balanceOf _who', function() {
      it('should fail', function() {
        const toRemove = initialBalance + 100;
        return burnFrom(someInvestor, toRemove).should.be.rejected;
      });
    });

    it('should subtract _value from balanceOf _who', function() {
      const toRemove = 5293;
      const target = initialBalance - toRemove;

      return burnFrom(someInvestor, toRemove)
        .then(function() {
          return deployedToken.balanceOf.call(someInvestor);
        })
        .then(function(bigNumBalance) {
          return bigNumBalance.toNumber().should.equal(target);
        });
    });

    it('should subtract _value from totalSupply', function() {
      const toRemove = 84731;
      let initialTotalSupply;
      let target;

      return deployedToken.totalSupply.call()
        .then(function(bigNumTotalSupply) {
          initialTotalSupply = bigNumTotalSupply.toNumber();
          target = initialTotalSupply - toRemove;
          return burnFrom(someInvestor, toRemove);
        })
        .then(function() {
          return deployedToken.totalSupply.call();
        })
        .then(function(newBigNumTotalSupply) {
          return newBigNumTotalSupply.toNumber().should.equal(target);
        });
    });

    // it('should emit the Burn event with _who and _value', function() {
    //   const toRemove = 6373;

    //   return burnFrom(someInvestor, toRemove)
    //     .then(function() {
    //       return getEventsByName(deployedToken, 'Burn');
    //     })
    //     .then(function(events) {
    //       events[0].args.who.should.equal(someInvestor);
    //       events[0].args.value.toNumber().should.equal(toRemove);
    //     });
    // });
  });

  describe('#transferFrom', function() {
    const someInvestorBalance = 99999;
    const someOtherInvestorBalance = 32;

    beforeEach(function() {
      return deployedToken.mint(someInvestor, someInvestorBalance, { from: transferAgent }).then(function() {
        return deployedToken.mint(someOtherInvestor, someOtherInvestorBalance, { from: transferAgent });
      });
    });

    const transferFrom = (from, to, value) => {
      return deployedToken.transferFrom(from, to, value, { from: transferAgent });
    };

    context('when _value is greater than balanceOf _from', function() {
      it('should fail', function() {
        return transferFrom(someOtherInvestor, someInvestor, 100).should.be.rejected;
      });
    });

    context('when _to is 0x0', function() {
      it('should fail', function() {
        return transferFrom(someInvestor, 0, 100).should.be.rejected;
      });
    });

    it('should subtract _value from balanceOf _from', function() {
      const toTransfer = 8742;
      const target = someInvestorBalance - toTransfer;
      return transferFrom(someInvestor, someOtherInvestor, toTransfer)
        .then(function() {
          return deployedToken.balanceOf.call(someInvestor);
        })
        .then(function(bigNumBalance) {
          return bigNumBalance.toNumber().should.equal(target);
        });
    });

    it('should add _value to balanceOf _to', function() {
      const toTransfer = 8742;
      const target = someOtherInvestorBalance + toTransfer;
      return transferFrom(someInvestor, someOtherInvestor, toTransfer)
        .then(function() {
          return deployedToken.balanceOf.call(someOtherInvestor);
        })
        .then(function(bigNumBalance) {
          return bigNumBalance.toNumber().should.equal(target);
        });
    });

    it('should emit the Transfer event with _from, _to, and _value', function() {
      const toTransfer = 874;
      return transferFrom(someInvestor, someOtherInvestor, toTransfer)
        .then(function() {
          return getEventsByName(deployedToken, 'Transfer');
        })
        .then(function(events) {
          const args = events[0].args;
          args.from.should.equal(someInvestor);
          args.to.should.equal(someOtherInvestor);
          args.value.toNumber().should.equal(toTransfer);
        });
    });

    it('should not change totalSupply', function() {
      let initialTotalSupply;
      return deployedToken.totalSupply.call()
        .then(function(bigNumTotalSupply) {
          initialTotalSupply = bigNumTotalSupply.toNumber();
          return transferFrom(someInvestor, someOtherInvestor, 500);
        })
        .then(function() {
          return deployedToken.totalSupply.call();
        })
        .then(function(newBigNumTotalSupply) {
          return newBigNumTotalSupply.toNumber().should.equal(initialTotalSupply);
        });
    });
  });
});