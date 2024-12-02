import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [isActive, setIsActive] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [photocardCount, setPhotocardCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
    timeOfTransaction(atmContract);
  };

  const timeOfTransaction = (atmContract) => {
    atmContract.on("Deposit", (amount, event) => {
      addTransactionHistory("Deposit", amount.toNumber());
    });

    atmContract.on("PhotocardBought", (amountSpent, event) => {
      addTransactionHistory("Photocard Bought", amountSpent.toNumber());
    });

    atmContract.on("AlbumBought", (amountSpent, event) => {
      addTransactionHistory("Album Bought", amountSpent.toNumber());
    });

    atmContract.on("Withdraw", (amount, event) => {
      addTransactionHistory("Withdraw", amount.toNumber());
    });
  };

  const addTransactionHistory = (type, amount) => {
    setTransactionHistory((prev) => [
      ...prev,
      { type, amount, timestamp: new Date().toLocaleString() },
    ]);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
      setIsActive(await atm.isActive());
      getPhotocardCount();
      getAlbumCount();
    }
  };

  const getPhotocardCount = async () => {
    if (atm) {
      setPhotocardCount((await atm.photocardCounter()).toNumber());
    }
  };

  const getAlbumCount = async () => {
    if (atm) {
      setAlbumCount((await atm.twiceAlbumCounter()).toNumber());
    }
  };
   
  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(5);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(5);
      await tx.wait();
      getBalance();
    }
  };

  const activateAccount = async () => {
    if (atm) {
      let tx = await atm.activateAccount();
      await tx.wait();
      getBalance();
    }
  };

  const deactivateAccount = async () => {
    if (atm) {
      let tx = await atm.deactivateAccount();
      await tx.wait();
      getBalance();
    }
  };

  const buyPhotocard = async () => {
    if (atm) {
      let tx = await atm.buyPhotocard();
      await tx.wait();
      getBalance(); // Update balance and photocard count
    }
  };

  const buyAlbum = async () => {
    if (atm) {
      let tx = await atm.buyAlbum();
      await tx.wait();
      getBalance(); // Update balance and album count
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance !== undefined ? balance : "Loading..."}</p>
        <p>Your Photocard Count: {photocardCount}</p> {/* Photocard counter */}
        <p>Your Twice Album Count: {albumCount}</p> {/* Album counter */}
        <p>Account Status: {isActive ? "Active" : "Inactive"} </p> {!isActive ? (<button onClick={activateAccount}>Activate Account</button>) : (
          <>
            <button onClick={deactivateAccount}>Deactivate Account</button>
            <br/><br/>
            <button onClick={deposit}>Deposit 5 ETH</button>
            <button onClick={withdraw}>Withdraw 5 ETH</button>
            <br/><br/>
            <button onClick={buyPhotocard}>Buy Twice Photocard (1 ETH)</button> {/* Buy photocard */}
            <button onClick={buyAlbum}>Buy Twice Album (5 ETH)</button> {/* Buy album */}
          </>
        )}
        <h3>Transaction History:</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {transactionHistory.map((tx, index) => (
            <li key={index}> {tx.type} - {tx.amount} ETH at {tx.timestamp}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Crambit's ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{` .container { text-align: center;
        }
      `}</style>
    </main>
  );
}
