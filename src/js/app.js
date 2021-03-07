App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('NavyBay.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var NavyBayArtifact = data;
      App.contracts.NavyBay = TruffleContract(NavyBayArtifact);

      // Set the provider for our contract
      App.contracts.NavyBay.setProvider(App.web3Provider);

    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-register', App.setNewUser);
    $(document).on('click', '.btn-upload', App.setNewFile);
    $(document).on('click', '.btn-buy', App.buyFile);
  },

  setNewUser: function(event) {
    event.preventDefault();

    var name = document.getElementById("register-name").value;
    var cat = document.getElementById("register-cat").value;
    var email = document.getElementById("register-email").value;
    var pass = document.getElementById("register-pass").value;

    var NavyBayInstance;

    web3.eth.getAccounts(function(error, accounts){
      if (error){
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NavyBay.deployed().then(function(instance){
        NavyBayInstance = instance;

        // Execute adopt as a transaction by sending account
        return NavyBayInstance.setNewUser(name, cat, email, pass, {from: account});
      }).then(function(result){
        window.location.href = "./personal.html";
      }).catch(function(err){
        alert("Wallet account already in use!");
      });
    });
  },

  getFileContent: function(){
    var file = document.getElementById("personal-file").files[0];
    if (file){
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function(evt) {
        document.getElementById("personal-aux").value = evt.target.result;
      }
      reader.onerror = function(evt) {
        alert("Error reading file!");
      }
    }
  },

  setNewFile: function(event) {
    event.preventDefault();

    var cat = document.getElementById("personal-cat").value;
    var title = document.getElementById("personal-title").value;
    var price = parseInt(document.getElementById("personal-price").value);
    App.getFileContent();

    var NavyBayInstance;

    web3.eth.getAccounts(function(error, accounts){
      if (error){
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NavyBay.deployed().then(function(instance){
        NavyBayInstance = instance;

        var content = document.getElementById("personal-aux").value.hashCode().toString();
        // Execute adopt as a transaction by sending account
        document.getElementById("personal-share-code").value = content;
        return NavyBayInstance.setNewFile(content, cat, title, price, {from: account});
      }).then(function(result){
        //
      }).catch(function(err){
        alert("File already exists in the blockchain!");
        console.log(err);
      });
    });
  },

  buyFile: function(event) {
    event.preventDefault();

    var code = document.getElementById("personal-search").value;

    var NavyBayInstance;

    web3.eth.getAccounts(function(error, accounts){
      if (error){
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.NavyBay.deployed().then(function(instance){
        NavyBayInstance = instance;

        // Execute adopt as a transaction by sending account
        return NavyBayInstance.buyFile(code, {from: account});
      }).then(function(result){
        //
      }).catch(function(err){
        alert("Unable to purchase!");
      });
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
  
