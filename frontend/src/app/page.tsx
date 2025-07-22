"use client";

import { useState } from "react";

const TOKEN_PAIRS = [
  { from: { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", chainId: 5 }, to: { symbol: "USDC", address: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", chainId: 421613 } }, // Goerli ETH to Arbitrum USDC
  { from: { symbol: "USDC", address: "0x07865c6e87b9f70255377e024ace6630c1eaa37f", chainId: 5 }, to: { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", chainId: 421613 } }, // Goerli USDC to Arbitrum ETH
  { from: { symbol: "DAI", address: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844", chainId: 5 }, to: { symbol: "USDT", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", chainId: 421613 } }, // Goerli DAI to Arbitrum USDT
  { from: { symbol: "WBTC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", chainId: 5 }, to: { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", chainId: 421613 } }, // Goerli WBTC to Arbitrum ETH
  { from: { symbol: "USDT", address: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9", chainId: 5 }, to: { symbol: "DAI", address: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844", chainId: 421613 } }, // Goerli USDT to Arbitrum DAI
];

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState(0);
  const [quote, setQuote] = useState<any>(null);
  const [altQuote, setAltQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet connect logic (MetaMask)
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWallet(accounts[0]);
      } catch (err) {
        setError("Wallet connection failed");
      }
    } else {
      setError("MetaMask not found");
    }
  };

  // Fetch quotes from backend
  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    setQuote(null);
    setAltQuote(null);
    const pair = TOKEN_PAIRS[selectedPair];
    try {
      const res = await fetch("http://localhost:3001/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: pair.from.address,
          toToken: pair.to.address,
          amount: "1000000000000000000000", // 1000 * 1e18 (example, adjust per token decimals)
          chainId: pair.from.chainId,
        }),
      });
      const data = await res.json();
      setQuote(data.oneInch);
      setAltQuote(data.alternative);
    } catch (err) {
      setError("Failed to fetch quotes");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center mb-2">Fusion+ Cross-Chain Swap (Testnet)</h1>
        <button
          onClick={connectWallet}
          className="w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          {wallet ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect MetaMask"}
        </button>
        <div>
          <label className="block mb-1 font-medium">Token Pair</label>
          <select
            className="w-full border rounded p-2"
            value={selectedPair}
            onChange={e => setSelectedPair(Number(e.target.value))}
          >
            {TOKEN_PAIRS.map((pair, i) => (
              <option key={i} value={i}>
                {pair.from.symbol} ({pair.from.chainId === 5 ? "Ethereum Goerli" : "Arbitrum"}) → {pair.to.symbol} ({pair.to.chainId === 5 ? "Ethereum Goerli" : "Arbitrum"})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">Amount</span>
          <span className="text-lg">$1,000 (fixed)</span>
        </div>
        <button
          onClick={fetchQuotes}
          className="w-full py-2 px-4 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Fetching Quotes..." : "Get Quotes"}
        </button>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {quote && (
          <div className="bg-gray-100 rounded p-4 mt-2">
            <div className="font-semibold mb-1">1inch Fusion+ Quote</div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(quote, null, 2)}</pre>
          </div>
        )}
        {altQuote && (
          <div className="bg-gray-100 rounded p-4 mt-2">
            <div className="font-semibold mb-1">Alternative DEX Quote</div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(altQuote, null, 2)}</pre>
          </div>
        )}
        <button
          className="w-full py-2 px-4 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition mt-2"
          disabled={!wallet || !quote}
        >
          Swap (Coming Soon)
        </button>
        <div className="text-xs text-gray-500 text-center mt-4">
          This is just a test, no legal responsibility.
        </div>
      </div>
    </div>
  );
}
