const { FusionSDK, NetworkEnum } = require('@1inch/fusion-sdk');

const sdk = new FusionSDK({
  url: 'https://api.1inch.dev/fusion',
  network: NetworkEnum.ETHEREUM,
  authKey: process.env.ONEINCH_API_KEY || 'YOUR_1INCH_API_KEY', // replace if not using .env
});

async function testFusionQuote() {
  try {
    const quote = await sdk.getQuote({
      srcChainId: 1,
      dstChainId: 1,
      srcTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      dstTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '1000000',
      walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      enableEstimate: true,
    });
    console.log('Fusion+ quote result:', quote);
  } catch (error) {
    console.error('Fusion+ quote error:', error.message);
  }
}

testFusionQuote(); 