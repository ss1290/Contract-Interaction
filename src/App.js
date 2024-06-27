import { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";
import abi from "./abi.json";
import { ColorRing } from "react-loader-spinner";
function App() {
  const [web3, setWeb3] = useState(null);
  const [checkBalanceAddress, setCheckBalanceAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [recipentAdd, setRecipentAdd] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [balanceLoader, setBalanceLoader] = useState(false);
  const [transferLoader, setTransferLoader] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const s = await window.ethereum.enable();
        console.log(s, "s");
      }
    } catch (error) {
      console.log(error, "e");
    }
  };
  const fetchWeb3Provider = async () => {
    try {
      let _web3;
      if (window.ethereum) {
        _web3 = new Web3(window.ethereum);
        setWeb3(_web3);
        const accounts = await _web3.eth.getAccounts();
        setConnectedAccount(accounts[0]);
      } else if (window.web3) {
        _web3 = new Web3(window.web3.currentProvider);
        setWeb3(_web3);
        const accounts = await _web3.eth.getAccounts();
        setConnectedAccount(accounts[0]);
      } else {
        alert("You have to install MetaMask !");
      }
    } catch (error) {
      console.log(error, "e");
    }
  };
  useEffect(() => {
    fetchWeb3Provider();
    fetchCurrentAccount();
  }, []);

  const fetchCurrentAccount = async () => {
    window.ethereum.on("accountsChanged", function (accounts) {
      setConnectedAccount(accounts[0]);
    });
  };

  const showBalance = async (e) => {
    try {
      e.preventDefault();
      setBalance(null);
      if (web3 == null) {
        alert("Connect your wallet first");
      } else {
        setBalanceLoader(true);
        if (checkBalanceAddress === "") {
          alert("Ethereum Address can't be empty ");
          setBalanceLoader(false);
          return;
        }
        if (!web3.utils.isAddress(checkBalanceAddress)) {
          alert("Invalid address");
          setBalanceLoader(false);
          setCheckBalanceAddress("");
          return;
        }
        const contract = new web3.eth.Contract(
          abi,
          "0x320b32EA6195de646aB0F7f9B58688f7a03B3438"
        );
        const _balance = await contract.methods
          .balanceOf(checkBalanceAddress)
          .call();
        setBalance(_balance.toString());
        setBalanceLoader(false);
        setCheckBalanceAddress("");
      }
    } catch (error) {
      setBalanceLoader(false);
      alert("Some error occured please try again");
    }
  };
  const transferToken = async (e) => {
    e.preventDefault();
    if (web3 == null) {
      alert("Connect your wallet first");
      setRecipentAdd(null);
      setTokenAmount(null);
    } else {
      setTransferLoader(true);
      const contract = new web3.eth.Contract(
        abi,
        "0x320b32EA6195de646aB0F7f9B58688f7a03B3438"
      );
      if (recipentAdd === "") {
        alert("Recipent's Ethereum Address can't be empty ");
        setTransferLoader(false);
        return;
      }
      if (tokenAmount === "") {
        alert("Token Amount can't be empty ");
        setTransferLoader(false);
        return;
      }
      if (!Number(tokenAmount)) {
        setTransferLoader(false);
        setTokenAmount("");
        alert("Token Amount should only be in numbers");
        return;
      }

      if (!web3.utils.isAddress(recipentAdd)) {
        setTransferLoader(false);
        alert("Invalid address");
        setRecipentAdd("");
        setTokenAmount("");
        return;
      }
      const account = await web3.eth.getAccounts();
      const _balance = await contract.methods.balanceOf(account[0]).call();
      if (_balance < tokenAmount) {
        setTransferLoader(false);
        alert("Insufficient balance");
        setRecipentAdd("");
        setTokenAmount("");
        return;
      }
      contract.methods
        .transferToken(recipentAdd, tokenAmount)
        .send({ from: account[0] })
        .then((res) => {
          setTransferLoader(false);
          alert("Token transferred successfully");
          setRecipentAdd("");
          setTokenAmount("");
        })
        .catch((e) => {
          setTransferLoader(false);
          alert("Some error occured, please try again");
          setRecipentAdd("");
          setTokenAmount("");
        });
    }
  };
  return (
    <div className={"mainContainer"}>
      <>
        {connectedAccount ? (
          <text className={"connectWallet"}>{connectedAccount}</text>
        ) : (
          <button
            className={"connectWallet"}
            onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </>
      <h1 style={{ fontSize: "x-large" }}>ERC20 Token Balance</h1>;
      <form className={"innerContainer"}>
        <text className={"formText"}>Ethereum Address</text>
        <input
          type={"text"}
          value={checkBalanceAddress}
          onChange={(e) => {
            setCheckBalanceAddress(e.target.value);
          }}
          placeholder={"Enter ethereum address"}
          required={true}
        />
        <>
          {balanceLoader ? (
            <ColorRing
              colors={["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]}
              wrapperClass={"loader"}
              height={"20px"}
            />
          ) : (
            <button
              className={"formButton"}
              onClick={(e) => showBalance(e)}>
              Submit
            </button>
          )}
        </>
      </form>
      {balance != null && (
        <div className={"innerBalanceTextontainer"}>
          <text className={"formText"}>Token Balance</text>
          <text className={"formText"}>{balance}</text>
        </div>
      )}
      <h1 style={{ fontSize: "x-large" }}>Transfer ERC20 Token</h1>
      <form className={"innerContainer"}>
        <text className={"formText"}>Recipent's Ethereum Address</text>
        <input
          type={"text"}
          value={recipentAdd}
          onChange={(e) => setRecipentAdd(e.target.value)}
          placeholder={"Enter ethereum address"}
          required={true}
        />
        <text className={"formText"}>Token Amount</text>
        <input
          type={"text"}
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          placeholder={"Enter Token Amount"}
          required={true}
        />
        {transferLoader ? (
          <ColorRing
            colors={["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]}
            wrapperClass={"loader"}
            height={"20px"}
          />
        ) : (
          <button
            className={"formButton"}
            onClick={(e) => transferToken(e)}>
            Transfer
          </button>
        )}
      </form>
    </div>
  );
}

export default App;
