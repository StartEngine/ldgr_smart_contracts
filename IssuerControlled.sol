pragma solidity ^0.4.24;

import "./LDGRIssuer.sol";

contract IssuerControlled {
    address public issuer;

    constructor(address _issuer) public {
        issuer = _issuer;
    }

    // look up TransferAgent role of the issuer
    modifier onlyIssuerTransferAgent() {
        LDGRIssuer c = LDGRIssuer(issuer);
        require(c.isTransferAgent(msg.sender), "Only Transfer Agent can perform this action.");
        _;
    }
}