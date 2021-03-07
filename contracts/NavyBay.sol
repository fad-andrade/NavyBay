pragma solidity ^0.5.0;

contract NavyBay{

  struct File{
    string cat;
    string title;
    uint price;
    address owner;
    bool exist;
  }

  struct User{
    string name;
    string cat;
    string email;
    string pass;
    uint amount;
    bool exist;
  }

  mapping (address => User) internal users;
  mapping (string => File) internal files;

  function setNewUser(string memory name, string memory cat, string memory email, string memory pass)
  public returns(bool){
    require(users[msg.sender].exist == false,
            "Wallet account already in use!");

    users[msg.sender].name = name;
    users[msg.sender].cat = cat;
    users[msg.sender].email = email;
    users[msg.sender].pass = pass;
    users[msg.sender].amount = address(msg.sender).balance;
    users[msg.sender].exist = true;
    return true;
  }

  function loginUser(string memory email, string memory pass)
  public view returns(bool){
    require(users[msg.sender].exist == true &&
            keccak256(bytes(users[msg.sender].email)) == keccak256(bytes(email)) &&
            keccak256(bytes(users[msg.sender].pass)) == keccak256(bytes(pass)),
            "Invalid credentials!");
    
    return true;
  }

  function stringToBytes8(string memory sourceStr)
  private pure returns(bytes8){
    bytes8 temp = 0x0;
    assembly {
      temp := mload(add(sourceStr, 32))
    }
    return temp;
  }

  function setNewFile(string memory hashed, string memory cat, string memory title, uint price)
  public returns(bool){
    require(files[hashed].exist == false,
            "File already exists in the blockchain!");
    files[hashed].cat = cat;
    files[hashed].title = title;
    files[hashed].price = price;
    files[hashed].owner = msg.sender;
    files[hashed].exist = true;
    return true;
  }

  function buyFile(string memory hashed)
  public returns(bool){
    users[msg.sender].amount = users[msg.sender].amount - files[hashed].price;
    address destination = address(files[hashed].owner);
    users[destination].amount = users[destination].amount + files[hashed].price;
    return true;
  }
}
