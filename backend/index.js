const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY || 'Your_1inch_API_Key';

// 1inch Fusion+ quote endpoint
app.post('/api/1inch-quote', async (req, res) => {
  try {
    const { fromToken, toToken, amount, chainId } = req.body;
    // Example endpoint, update as needed for Fusion+
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

// Comparison endpoint
app.post('/api/compare', async (req, res) => {
  try {
    const { fromToken, toToken, amount, chainId } = req.body;
    // Get 1inch quote
    const oneInchRes = await axios.post('http://localhost:3001/api/1inch-quote', { fromToken, toToken, amount, chainId });
    // Get alternative quote
    const altRes = await axios.post('http://localhost:3001/api/alt-quote', { fromToken, toToken, amount, chainId });
    // Calculate savings (if possible)
    res.json({
      oneInch: oneInchRes.data,
      alternative: altRes.data,
      savings: null // Calculate if both prices available
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 