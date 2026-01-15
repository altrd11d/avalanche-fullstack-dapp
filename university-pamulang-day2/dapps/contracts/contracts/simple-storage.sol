// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {

    //  Ownership
    address public owner;
    string public ownerName;

    event OwnerSet(address indexed ownerAddress, string ownerName);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    //  Storage
    uint256 private storedValue;

    //  Events
    event ValueUpdated(uint256 newValue);

    //  Constructor
    constructor(string memory _ownerName) {
        owner = msg.sender;
        ownerName = _ownerName;
        emit OwnerSet(owner, ownerName);   // muncul saat deploy
    }

    //  Functions
    function setValue(uint256 _value) public onlyOwner {
        storedValue = _value;
        emit ValueUpdated(_value);
    }

    function getValue() public view returns (uint256) {
        return storedValue;
    }
}
