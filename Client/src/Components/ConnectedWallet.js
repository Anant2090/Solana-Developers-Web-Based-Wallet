import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

const ConnectedWallet = ({ mnemonic, privateKey, address }) => {
  const [balance, setBalance] = useState(null);
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetError, setFaucetError] = useState(null);

  const [isVisible, setIsVisible] = useState(false); // State to trigger fade-in animation

  const use = "****************************************************************************************";

  // Function to fetch the balance
  async function fetchBal(publicKey) {
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSol = balanceInLamports / 1e9;
      setBalance(balanceInSol);
    } catch (error) {
      console.error("Error fetching Solana balance:", error);
    }
  }
  function clearLocalStorage() {
    localStorage.clear();
    alert("Local storage cleared!");
    window.location.reload();
  }

  // Function to handle transaction
  async function MakeTransaction() {
    setLoading(true);
    setError(null);
    try {
      const receiverElement = document.querySelector(".receiver");
      const amountElement = document.querySelector(".Amount");

      if (!receiverElement || !amountElement) {
        throw new Error("Input elements not found.");
      }

      const receiver = receiverElement.value;
      const amount = parseFloat(amountElement.value);

      // Alert if inputs are empty
      if (!receiver || isNaN(amount) || amount <= 0) {
        alert("Please provide valid inputs for receiver address and amount.");
        setLoading(false);
        return;
      }

      const response = await axios.post("https://solana-developers-web-based-wallet.onrender.com/sendTransaction", {
        mnemonic,
        recipient: receiver,
        amount,
      });

      alert("Transaction successful!");
      console.log(response.data);
    } catch (error) {
      console.error("Error making transaction:", error.response ? error.response.data : error.message);
      setError("Failed to make transaction. Please try again.");
      alert("Transaction failed!");
    } finally {
      setLoading(false);
    }
  }

  // Function to handle faucet airdrop
  async function faucet_transation() {
    setFaucetLoading(true);
    setFaucetError(null);
    try {
      const receiverElement = document.querySelector(".fauadd");
      const amountElement = document.querySelector(".faubal");

      if (!receiverElement || !amountElement) {
        throw new Error("Input elements not found.");
      }

      const receiver = receiverElement.value;
      const amount = parseFloat(amountElement.value);

      // Alert if inputs are empty
      if (!receiver || isNaN(amount) || amount <= 0) {
        alert("Please provide valid inputs for address and amount.");
        setFaucetLoading(false);
        return;
      }

      // Make the faucet request
      const response = await axios.post("https://solana-developers-web-based-wallet.onrender.com/ClaimFaucet", {
        address: receiver,
        amount,
      });

      // If the response indicates the faucet was already claimed
      if (response.data.success === false) {
        setFaucetError("Faucet claim failed. You may have reached your limit.");
        alert("Faucet claim failed. You may have already claimed.");
      } else {
        alert("Airdrop claimed successfully!");
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error making faucet request:", error.response ? error.response.data : error.message);
      setFaucetError("Failed to claim airdrop. Please try again.");
      alert("Airdrop claim failed!");
    } finally {
      setFaucetLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      const publicKey = new PublicKey(address);
      fetchBal(publicKey);
    }

    // Trigger the fade-in effect after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100); // Adding a short delay before triggering the animation
  }, [address]);

  return (
    <div className={`relative transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <img
        className="h-[3vw] w-[30vw] text-center ml-[500px]"
        src="https://faucet.solana.com/_next/static/media/solanaLogo.74d35f7a.svg"
        alt="Solana Logo"
      />
      <div className="h-[90vh] w-[100vw] bg-gradient-to-b from-black via-gray-900 to-[#2C1331] flex justify-between items-center p-5">
        {/* Left Section - Wallet Information */}
        <div className="h-full w-[64%] rounded-2xl bg-gray-900/75 p-6 flex flex-col justify-center gap-[20px]">
          <div className="border rounded-md">
            <div className="text-white mb-5">
              <h1 className="text-[28px] font-semibold">Wallet Information</h1>
            </div>
            <div className="text-white mb-5">
              <div className="text-[18px]">
                <div className="mb-2 text-[17px] gap-1 items-baseline flex justify-center">
                  <span className="font-semibold">Private Key:</span>
                  <span className="text-gray-400 text-sm">
                    {hide ? (
                      <div className="min-w-[45.5vw] text-[18.8px]">{use}</div>
                    ) : (
                      <div className="min-w-[45.5vw]">{privateKey}</div>
                    )}
                  </span>
                  <button className="ml-5" onClick={() => setHide((prevHide) => !prevHide)}>
                    Toggle
                  </button>
                </div>
                <div className="mb-2 text-[17px] items-baseline flex justify-center gap-2">
                  <span className="font-semibold">Address:</span>
                  <span className="text-gray-400 text-md">{address}</span>
                </div>
                <div className="text-[25px] flex justify-center items-baseline gap-2">
                  <span className="font-semibold">Balance:</span>
                  <span className="text-gray-400 text-xl">
                    {balance !== null ? `${balance} SOL` : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-white border rounded-md">
            <div className="p-4 bg-gray-900/75 rounded-lg">
              <h2 className="text-[28px] mb-4">Transaction</h2>
              <div className="flex mb-5">
                <p className="text-[20px] mr-2 w-[20%]">Receiver's Address:</p>
                <input
                  className="receiver w-[80%] px-4 py-2 rounded-md pl-2 bg-gray-800/70"
                  type="text"
                />
              </div>
              <div className="flex">
                <p className="text-[20px] mr-2 w-[20%]">Amount In SOL:</p>
                <input
                  className="Amount w-[80%] bg-gray-800/70 px-4 py-2 rounded-md"
                  type="text"
                />
              </div>
              <button
                onClick={MakeTransaction}
                className="w-[30%] mt-5 py-3 bg-purple-600 hover:bg-purple-700 rounded-md transition duration-200 focus:outline-none"
              >
                {loading ? "Processing..." : "Send"}
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        </div>

        {/* Right Section - Placeholder */}
        <div className="h-full w-[35%] bg-gray-900/75 rounded-2xl flex items-center flex-col gap-5 justify-center">
          <div className="bg-gray-900/75 border p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Request Airdrop</h2>
            <p className="text-sm text-gray-400 mb-4">Maximum of 2 requests per hour</p>
            <div className="flex flex-col justify-center mb-4">
              <div>
                <span className="mr-2 text-[20px]">Enter Wallet Address:</span>
                <input className="fauadd bg-gray-800/70 pl-3 py-2 px-4 rounded-md" type="text" />
              </div>
              <div className="mt-2">
                <span className="mr-2 text-[20px]">Enter Amount In SOL:</span>
                <input className="faubal bg-gray-800/70 px-4 py-2 rounded-md" type="text" />
              </div>
            </div>
            <button
              onClick={faucet_transation}
              className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none"
            >
              {faucetLoading ? "Processing..." : "Claim Faucet"}
            </button>
            {faucetError && <p className="text-red-500 mt-2">{faucetError}</p>}
          </div>
          <button
            className="right-5 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={clearLocalStorage}
          >
            Delete Wallet Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectedWallet;
