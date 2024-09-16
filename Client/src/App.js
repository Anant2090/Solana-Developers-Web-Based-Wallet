import { useState, useEffect } from "react";
import axios from "axios";
import ConnectedWallet from "./Components/ConnectedWallet";
import "./App.css"; // Import custom CSS for transition if needed

function App() {
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [saved, setSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // State for visibility

  // Fetch data from localStorage when the component mounts
  useEffect(() => {
    const savedAddress = localStorage.getItem('address');
    const savedPrivateKey = localStorage.getItem('privateKey');
    const savedMnemonic = localStorage.getItem('mnemonic');
    const isSaved = localStorage.getItem('saved') === 'true';

    if (savedAddress && savedPrivateKey && savedMnemonic) {
      setAddress(savedAddress);
      setPrivateKey(savedPrivateKey);
      setMnemonic(savedMnemonic);
      setSaved(isSaved);
    }
  }, []);

  async function getdata() {
    try {
      const response = await axios.post("https://solana-developers-web-based-wallet.onrender.com/generateWallet", {});
      const { Address, privateKey, mnemonic } = response.data;

      setAddress(Address);
      setPrivateKey(privateKey);
      setMnemonic(mnemonic);

      // Trigger the visibility for the fade-in effect
      setTimeout(() => {
        setIsVisible(true); // Fade in after mnemonic is set
      }, 100);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  }

  const handleSaveMnemonic = () => {
    localStorage.setItem('address', address);
    localStorage.setItem('privateKey', privateKey);
    localStorage.setItem('mnemonic', mnemonic);
    localStorage.setItem('saved', 'true');
    setSaved(true);
  };

  return (
    <div className="App bg-gradient-to-b from-black via-gray-900 to-[#2C1331] h-[100vh] text-white flex items-center justify-center">
      {saved ? (
        <div>
          <ConnectedWallet mnemonic={mnemonic} privateKey={privateKey} address={address} />
        </div>
      ) : (
        <div className="h-[50vh] w-[50vw] bg-gray-900/75 flex items-center justify-center flex-col gap-[30px] p-[20px] rounded-lg shadow-lg">
          {mnemonic ? (
            <div className={`flex flex-col items-center gap-[20px] transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="text-xl font-bold">Your Mnemonic</div>
              <div className="bg-gray-900/75 p-[15px] rounded-md text-sm font-mono tracking-wide text-center text-green-300 leading-6 border border-gray-700 shadow-lg">
                {mnemonic.split(" ").map((word, index) => (
                  <span key={index} className="px-2">
                    {word}
                  </span>
                ))}
              </div>
              <button
                className="mt-[20px] py-2 px-6  bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md"
                onClick={handleSaveMnemonic}
              >
                Save Mnemonic
              </button>
            </div>
          ) : (
            <button
              onClick={getdata}
              className="py-2 px-6  bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md"
            >
              Create Wallet
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
