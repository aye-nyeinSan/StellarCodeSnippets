import * as StellarSdk from '@stellar/stellar-sdk';

// Generate a random key pair
const pair = StellarSdk.Keypair.random();
const secretKey = pair.secret();
const publicKey = pair.publicKey();
console.log("Secret Key: ", secretKey);
console.log("Public Key: ", publicKey);

async function main() {
  // Use the public key to claim lumens from Friendbot
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${pair.publicKey()}`);
    const resJSON = await response.json();
    console.log("SUCCESS! You have a new account :)\n", resJSON);
  } catch (error) {
    console.log("Failed!", error);
  }

  // Getting transactions
  var server = new StellarSdk.Horizon.Server(`https://horizon-testnet.stellar.org`);
  server.transactions().forAccount(publicKey)
    .call().then((r) => console.log(r))
    .catch((error) => console.log("Error fetching transactions:", error));
}

main();
