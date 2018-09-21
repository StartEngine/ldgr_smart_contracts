pragma solidity ^0.4.24;

import "../libs/IssuerControlled.sol";
import "./LDGRToken.sol";

contract LDGRSecurity is IssuerControlled {
    string public name;
    string public symbol;
    address public token; // main token 0
    address[] tokens; // all tokens

    event CreateToken(
        address indexed newToken,
        uint256 indexed issuanceNumber
    );

    constructor (
        address _issuer,
        string _name,
        string _symbol
    ) IssuerControlled(_issuer) public {
        name = _name;
        symbol = _symbol;
        token = new LDGRToken(_issuer, _name, _symbol, 0);
        tokens.push(token);
        emit CreateToken(token, 0);
    }

    function getAllTokens() public view returns (address[]) {
        return tokens;
    }

    function createToken(uint256 _issuanceNumber) public onlyIssuerTransferAgent returns (address) {
        return _createToken(_issuanceNumber);
    }

    function _createToken(uint256 _issuanceNumber) internal returns (address) {
        LDGRToken newToken = new LDGRToken(issuer, name, symbol, _issuanceNumber);
        tokens.push(newToken);
        emit CreateToken(newToken, _issuanceNumber);
        return newToken;
    }
}