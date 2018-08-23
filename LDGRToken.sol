pragma solidity ^0.4.24;

/*
Interface for LDGR
*/

import "./IssuerControlled.sol";
import "./SafeMath.sol";

contract LDGRToken is IssuerControlled {
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint256 public issuanceNumber;
    mapping(address => uint256) balances;
    uint256 public totalSupply;
    uint8 public decimals;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    constructor(
        address _issuer,
        string _name,
        string _symbol,
        uint256 _issuanceNumber
    ) IssuerControlled(_issuer) public {
        name = _name;
        symbol = _symbol;
        issuanceNumber = _issuanceNumber;
        decimals = 0;
    }

    function balanceOf(address _investor) public view returns (uint256) {
        return balances[_investor];
    }

    function transferFrom(address _from, address _to, uint256 _value) public onlyIssuerTransferAgent returns (bool) {
        require(_value <= balances[_from], "Not enough balance.");
        require(_to != address(0), "_to is not valid.");
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function mint(address _to, uint256 _value) public onlyIssuerTransferAgent returns (bool) {
        require(_to != address(0), "_to is not valid.");
        balances[_to] = balances[_to].add(_value);
        totalSupply = totalSupply.add(_value);
        emit Transfer(address(0), _to, _value);
        return true;
    }

    function burnFrom(address _who, uint256 _value) public onlyIssuerTransferAgent returns (bool) {
        require(_value <= balances[_who], "_value cannot be greater than balance.");
        balances[_who] = balances[_who].sub(_value);
        totalSupply = totalSupply.sub(_value);
        emit Transfer(_who, address(0), _value);
        return true;
    }
}