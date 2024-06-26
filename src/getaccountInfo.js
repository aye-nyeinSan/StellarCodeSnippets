import * as StellarSdk from '@stellar/stellar-sdk';

// Horizon server instance
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Load the account details from the Stellar network
export async function getAccount(a) {
  try {
    const account = await server.loadAccount(a);
   account.balances.forEach(balance=>{
    if (balance.asset_code === expectedAssetCode && balance.asset_issuer === expectedIssuer) {
      console.log('Matching balance found:', balance);
    }
   })
  } catch (error) {
    console.error('Error loading account:', error);
  }
}


