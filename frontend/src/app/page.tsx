"use client";

import { useState } from "react";

const TOKENS = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "DAI", name: "Dai" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Swap");
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prevent selecting the same token for both
  const availableToTokens = TOKENS.filter(t => t.symbol !== fromToken.symbol);
  const availableFromTokens = TOKENS.filter(t => t.symbol !== toToken.symbol);

  // MetaMask connect logic
  const connectWallet = async () => {
    setError(null);
    setConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setWallet(accounts[0]);
      } else {
        setError('MetaMask not found');
      }
    } catch (err: any) {
      setError('Wallet connection failed');
    }
    setConnecting(false);
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  // Validation logic
  const minAmount = 0.0045;
  const maxAmount = 1000;
  let validationMessage = null;
  if (!fromAmount || Number(fromAmount) <= 0) {
    validationMessage = 'Enter a valid amount.';
  } else if (fromToken.symbol === 'ETH' && Number(fromAmount) < minAmount) {
    validationMessage = `Base currency amount is below the minimum of ${minAmount} ETH`;
  } else if (Number(fromAmount) > maxAmount) {
    validationMessage = `Amount exceeds the maximum allowed (${maxAmount}).`;
  }
  if (error) validationMessage = error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-10 flex flex-col gap-8">
        {/* Tabs */}
        <div className="flex justify-center mb-2">
          {['Buy', 'Sell', 'Swap'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-semibold border-b-2 transition-colors duration-200 focus:outline-none
                ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
              style={{ marginRight: tab !== 'Swap' ? '0.5rem' : 0 }}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Divider */}
        <div className="border-b border-gray-200 mb-2" />
        {/* Title and subtitle */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2">
              {/* Ethereum icon placeholder */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e6f0fa"/><path d="M12 3L12.1 3.3V16.6L12 16.7L12 3Z" fill="#627EEA"/><path d="M12 3L11.9 3.3V16.6L12 16.7L12 3Z" fill="#627EEA"/><path d="M12 17.8L12.1 17.9V20.7L12 21L12 17.8Z" fill="#627EEA"/><path d="M12 17.8L11.9 17.9V20.7L12 21L12 17.8Z" fill="#627EEA"/><path d="M12 16.7L18.2 13.2L12 3V16.7Z" fill="#627EEA"/><path d="M12 16.7L5.8 13.2L12 3V16.7Z" fill="#627EEA"/><path d="M12 17.8L18.2 14.3L12 21V17.8Z" fill="#627EEA"/><path d="M12 17.8L5.8 14.3L12 21V17.8Z" fill="#627EEA"/></svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">Swap Ethereum seamlessly.</h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Swap Ethereum quickly and securely, across multiple chains and wallets. It’s all there in your account.
          </p>
        </div>
        {/* Divider */}
        <div className="border-b border-gray-200" />
        {/* Swap form UI */}
        <div className="flex flex-col gap-4 w-full relative">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-20 rounded-lg">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              <span className="text-blue-600 font-medium">Fetching quote...</span>
            </div>
          )}
          {/* From input */}
          <div className="flex items-center bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 relative">
            <input
              type="number"
              placeholder="0.00"
              className="flex-1 bg-transparent outline-none text-lg sm:text-xl font-semibold"
              value={fromAmount}
              onChange={e => setFromAmount(e.target.value)}
              min="0"
            />
            <div className="relative">
              <button
                className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white border border-gray-300 rounded-lg ml-2 sm:ml-3 text-gray-700 font-medium"
                type="button"
                onClick={() => setShowFromDropdown(v => !v)}
              >
                <span className="hidden sm:inline-block">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="mr-1"><circle cx="12" cy="12" r="10" fill="#e6f0fa"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#627EEA">{fromToken.symbol[0]}</text></svg>
                </span>
                {fromToken.symbol}
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {showFromDropdown && (
                <div className="absolute z-10 left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {availableFromTokens.map(token => (
                    <div
                      key={token.symbol}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => { setFromToken(token); setShowFromDropdown(false); }}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e6f0fa"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#627EEA">{token.symbol[0]}</text></svg>
                      {token.symbol} <span className="text-xs text-gray-400">{token.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Swap arrow */}
          <div className="flex justify-center">
            <span className="inline-block bg-gray-100 rounded-full p-2 border border-gray-200">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-5-5m5 5l5-5" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          {/* To input */}
          <div className="flex items-center bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 relative">
            <input
              type="number"
              placeholder="0.00"
              className="flex-1 bg-transparent outline-none text-lg sm:text-xl font-semibold"
              value={""}
              disabled
            />
            <div className="relative">
              <button
                className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white border border-gray-300 rounded-lg ml-2 sm:ml-3 text-gray-700 font-medium"
                type="button"
                onClick={() => setShowToDropdown(v => !v)}
              >
                <span className="hidden sm:inline-block">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="mr-1"><circle cx="12" cy="12" r="10" fill="#e6f0fa"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#627EEA">{toToken.symbol[0]}</text></svg>
                </span>
                {toToken.symbol}
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {showToDropdown && (
                <div className="absolute z-10 left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {availableToTokens.map(token => (
                    <div
                      key={token.symbol}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => { setToToken(token); setShowToDropdown(false); }}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e6f0fa"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#627EEA">{token.symbol[0]}</text></svg>
                      {token.symbol} <span className="text-xs text-gray-400">{token.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Error/warning message placeholder */}
          <div className="text-red-500 text-sm text-center min-h-[1.5em]">{validationMessage}</div>
          {/* Call-to-action button */}
          {wallet ? (
            <button
              className="w-full py-3 px-4 rounded-lg bg-green-600 text-white text-lg font-semibold hover:bg-green-700 transition mt-2"
              onClick={disconnectWallet}
              type="button"
            >
              Connected: {wallet.slice(0, 6)}...{wallet.slice(-4)} (Disconnect)
            </button>
          ) : (
            <button
              className="w-full py-3 px-4 rounded-lg bg-purple-600 text-white text-lg font-semibold hover:bg-purple-700 transition mt-2 disabled:opacity-60"
              onClick={connectWallet}
              type="button"
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          )}
          {/* Temporary button to simulate loading */}
          <button
            className="w-full py-2 px-4 rounded-lg bg-blue-100 text-blue-700 font-medium mt-2"
            type="button"
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
          >
            Simulate Fetch Quote
          </button>
        </div>
        {/* Divider */}
        <div className="border-b border-gray-200" />
        {/* Quote/result display area */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-5 mt-2 min-h-[64px] flex items-center justify-center text-gray-500 text-base">
          Your quote will appear here.
        </div>
      </div>
    </div>
  );
}
