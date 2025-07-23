const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { ethers } = require('ethers');
const { FusionSDK, NetworkEnum } = require('@1inch/fusion-sdk');
const { SDK: CrossChainSdk } = require('@1inch/cross-chain-sdk');
const app = express();
app.use(cors());
app.use(express.json());

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY || 'Your_1inch_API_Key';
const TESTNET_RPC_URL = process.env.TESTNET_RPC_URL || 'https://rpc.ankr.com/eth_goerli';
const provider = new ethers.JsonRpcProvider(TESTNET_RPC_URL);

const fusionSdk = new FusionSDK({
  url: 'https://api.1inch.dev/fusion',
  network: NetworkEnum.ETHEREUM,
  authKey: ONEINCH_API_KEY,
});

const crossChainSdk = new CrossChainSdk({
  url: 'https://api.1inch.dev/cross-chain',
  authKey: ONEINCH_API_KEY,
});

// 1inch quote endpoint (classic)
app.post('/api/1inch-quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount, chainId } = req.body;
    const url = `https://api.1inch.dev/swap/v5.2/${chainId}/quote`;
    const response = await axios.get(url, {
      params: {
        src: fromToken,
        dst: toToken,
        amount,
      },
      headers: {
        Authorization: `Bearer ${ONEINCH_API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alternative DEX quote endpoint (Uniswap as fallback)
app.post('/api/alt-quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount, chainId } = req.body;
    // Example: Uniswap v3 quote API (replace with real endpoint or aggregator as needed)
    // This is a placeholder; you may need to use a public aggregator or simulate
    res.json({
      price: null,
      message: 'Alternative DEX quote not implemented yet.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fusion+ quote endpoint
app.post('/api/fusion-quote', async (req, res) => {
  try {
    const { srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, walletAddress, enableEstimate } = req.body;
    if (!walletAddress || walletAddress.length !== 42) {
      return res.status(400).json({ error: 'walletAddress is required and must be a valid Ethereum address.' });
    }
    const params = {
      srcChainId,
      dstChainId: dstChainId || srcChainId, // for single-chain, both are the same
      srcTokenAddress,
      dstTokenAddress,
      amount,
      enableEstimate: enableEstimate !== false, // default to true
      walletAddress,
    };
    console.log('Calling fusionSdk.getQuote with:', params);
    const quote = await fusionSdk.getQuote(params);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fusion+ order endpoint
app.post('/api/fusion-order', async (req, res) => {
  try {
    // The body should include all required Fusion+ order params
    const order = await fusionSdk.placeOrder(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comparison endpoint
app.post('/api/compare', async (req, res) => {
  try {
    const { fromToken, toToken, amount, chainId } = req.body;
    // Get 1inch quote
    const oneInchRes = await fusionSdk.getQuote({ fromToken, toToken, amount, walletAddress: '0x0000000000000000000000000000000000000000', chainId: chainId || NetworkEnum.ETHEREUM });
    // Get alternative quote
    const altRes = await axios.post('http://localhost:3001/api/alt-quote', { fromToken, toToken, amount, chainId });
    // Calculate savings (if possible)
    res.json({
      oneInch: oneInchRes,
      alternative: altRes.data,
      savings: null // Calculate if both prices available
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1inch swap endpoint (classic)
app.post('/api/1inch-swap', async (req, res) => {
  try {
    const { fromToken, toToken, amount, fromAddress, slippage, chainId } = req.body;
    const url = `https://api.1inch.dev/swap/v5.2/${chainId}/swap`;
    const response = await axios.get(url, {
      params: {
        src: fromToken,
        dst: toToken,
        amount,
        from: fromAddress,
        slippage: slippage || 1,
        disableEstimate: false,
      },
      headers: {
        Authorization: `Bearer ${ONEINCH_API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cross-chain quote endpoint
app.post('/api/cross-chain-quote', async (req, res) => {
  try {
    const { srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, enableEstimate, walletAddress } = req.body;
    if (!walletAddress || walletAddress.length !== 42) {
      return res.status(400).json({ error: 'walletAddress is required and must be a valid Ethereum address.' });
    }
    const params = {
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      enableEstimate: enableEstimate !== false, // default to true
      walletAddress,
    };
    console.log('Calling crossChainSdk.getQuote with:', params);
    const quote = await crossChainSdk.getQuote(params);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cross-chain swap endpoint
app.post('/api/cross-chain-swap', async (req, res) => {
  try {
    const { srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount, enableEstimate, walletAddress } = req.body;
    if (!walletAddress || walletAddress.length !== 42) {
      return res.status(400).json({ error: 'walletAddress is required and must be a valid Ethereum address.' });
    }
    const params = {
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      enableEstimate: enableEstimate !== false, // default to true
      walletAddress,
    };
    console.log('Calling crossChainSdk.getSwap with:', params);
    const swap = await crossChainSdk.getSwap(params);
    res.json(swap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/network-info', async (req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({ blockNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 