pragma solidity ^0.4.23;

contract TransferAgentControlled {
    address public transferAgent;

    constructor(address _initialTransferAgent) public {
        transferAgent = _initialTransferAgent;
    }

    modifier onlyTransferAgent() {
        require(msg.sender == transferAgent, "Only Transfer Agent can perform this action.");
        _;
    }

    function isTransferAgent(address _lookup) public view returns (bool) {
        return _lookup == transferAgent;
    }
}