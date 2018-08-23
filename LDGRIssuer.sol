pragma solidity ^0.4.24;

import "./TransferAgentControlled.sol";
import "./Owned.sol";
import "./LDGRSecurity.sol";

contract LDGRIssuer is Owned, TransferAgentControlled {
    string public name;
    address[] securities;

    event CreateSecurity(
        address indexed newSecurity,
        string name,
        string symbol
    );

    constructor (
        address _initialOwner,
        address _initialTransferAgent,
        string _name
    ) Owned(_initialOwner) TransferAgentControlled(_initialTransferAgent) public {
        name = _name;
    }

    event TransferAgentUpdated(
        address indexed previousTransferAgent,
        address indexed newTransferAgent
    );

    function setTransferAgent(address _newTransferAgent) public onlyOwner {
        _setTransferAgent(_newTransferAgent);
    }

    function _setTransferAgent(address _newTransferAgent) internal {
        require(_newTransferAgent != address(0), "Address cannot be 0.");
        emit TransferAgentUpdated(transferAgent, _newTransferAgent);
        transferAgent = _newTransferAgent;
    }

    function getSecurities() public view returns (address[]) {
        return securities;
    }

    function createSecurity(string _name, string _symbol) public onlyTransferAgent returns (address) {
        return _createSecurity(_name, _symbol);
    }

    function _createSecurity(string _name, string _symbol) internal returns (address) {
        address newSecurity = new LDGRSecurity(this, _name, _symbol);
        securities.push(newSecurity);
        emit CreateSecurity(newSecurity, _name, _symbol);
        return newSecurity;
    }
}