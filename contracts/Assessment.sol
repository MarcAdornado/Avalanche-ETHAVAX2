// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    bool public isActive;
    uint256 public photocardCounter;
    uint256 public twiceAlbumCounter;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event AccountActivated();
    event AccountDeactivated();
    event PhotocardBought(uint256 amountSpent);
    event AlbumBought(uint256 amountSpent);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        isActive = false;
    }

    modifier accountActive() {
        require(isActive, "Account is not active");
        _;
    }

    function activateAccount() public {
        require(!isActive, "Account is already active");
        require(msg.sender == owner, "You are not the owner of this account");
        isActive = true;
        emit AccountActivated();
    }

    function deactivateAccount() public accountActive {
        require(msg.sender == owner, "You are not the owner of this account");
        balance = 0;
        isActive = false;
        emit AccountDeactivated();
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable accountActive {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public accountActive {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function buyPhotocard() public accountActive {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= 1, "Insufficient balance to buy a photocard");
        balance -= 1;
        photocardCounter += 1;
        emit PhotocardBought(1);
    }

    function buyAlbum() public accountActive {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= 5, "Insufficient balance to buy an album");
        balance -= 5;
        twiceAlbumCounter += 1;
        emit AlbumBought(5);
    }

}
