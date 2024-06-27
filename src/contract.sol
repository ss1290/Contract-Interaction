// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DemoToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Demo Token", "DT") {
        _mint(msg.sender, initialSupply);
    }

    function transferToken(address to, uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficent balance");
        require(to != address(0), "Invalid address");
        transfer(to, amount);
    }
}
