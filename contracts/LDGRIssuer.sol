pragma solidity ^0.4.24;

import "../libs/TransferAgentControlled.sol";
import "../libs/Owned.sol";
import "./LDGRSecurity.sol";

contract LDGRIssuer is Owned, TransferAgentControlled {
    string public name;
    string public stateFileNumber;
    string public stateOfIncorporation;
    string public physicalAddressOfOperation;
    address[] securities;

    event CreateSecurity(
        address indexed newSecurity,
        string name,
        string symbol
    );

    event TransferAgentUpdated(
        address indexed previousTransferAgent,
        address indexed newTransferAgent
    );

    event PhysicalAddressOfOperationUpdated(
        string previousPhysicalAddressOfOperation,
        string newPhysicalAddressOfOperation
    );

    constructor (
        address _initialOwner,
        address _initialTransferAgent,
        string _name,
        string _stateFileNumber,
        string _stateOfIncorporation,
        string _physicalAddressOfOperation
    ) Owned(_initialOwner) TransferAgentControlled(_initialTransferAgent) public {
        name = _name;
        stateFileNumber = _stateFileNumber;
        stateOfIncorporation = _stateOfIncorporation;
        physicalAddressOfOperation = _physicalAddressOfOperation;
    }

    function setTransferAgent(address _newTransferAgent) public onlyOwner {
        _setTransferAgent(_newTransferAgent);
    }

    function setPhysicalAddressOfOperation(string _newPhysicalAddressOfOperation) public onlyOwner {
        _setPhysicalAddressOfOperation(_newPhysicalAddressOfOperation);
    }

    function _setPhysicalAddressOfOperation(string _newPhysicalAddressOfOperation) internal {
        emit PhysicalAddressOfOperationUpdated(physicalAddressOfOperation, _newPhysicalAddressOfOperation);
        physicalAddressOfOperation = _newPhysicalAddressOfOperation;
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