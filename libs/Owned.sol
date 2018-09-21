pragma solidity ^0.4.24;

contract Owned {
    address public owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor(address _initialOwner) public {
        owner = _initialOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only current owner can perform this action.");
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        _transferOwnership(_newOwner);
    }

    function _transferOwnership(address _newOwner) internal {
        require(_newOwner != address(0), "New owner cannot be null.");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}