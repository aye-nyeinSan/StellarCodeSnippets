import * as StellarSdk from "@stellar/stellar-sdk";

// Horizon server instance
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

// Function to combine all four operations in one transaction
export async function executeCombinedTransaction(issuerId, issuerKey, distributionId, distributionKey, DMMKAsset, nUSDTAsset) {
  const issuer = await server.loadAccount(issuerId.publicKey());
  const distributionAccount = await server.loadAccount(distributionId.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(distributionAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
 // 1. Payment Operation of 3,000 Ks from client to backend agent account ( 3 DMMK)
  .addOperation(  
    StellarSdk.Operation.payment({
      destination: issuer.account_id,
      asset: DMMKAsset,
      amount: "3",
    })
  )
  
// 2. Payment Operation of 1.5 XLM from backend agent account 
  .addOperation(
    StellarSdk.Operation.payment({
      source:  issuer.account_id,
      destination: distributionAccount.id,
      asset: StellarSdk.Asset.native(),
      amount: "1.5",
    })
  )

// 3. Change Trust Operation to add nUSDT trustline with limit 10,000
  .addOperation(
    StellarSdk.Operation.changeTrust({
      asset: nUSDTAsset,
      limit: "10000"
    })
  )
 
 // 4. Set Trustline Flags Operation to approve nUSDT trustline
  .addOperation(
    StellarSdk.Operation.allowTrust({
      trustor: distributionAccount.id,
      assetCode: nUSDTAsset.code,
      authorize: true,
    })
  )
  .setTimeout(180)
  .build();
  transaction.sign(distributionKey); 
  transaction.sign(issuerKey);

//Backend Agent will sign and send the XDR envelope to the client
  const transactionXDR = transaction.toXDR();
 // console.log('Transaction XDR envelope:', transactionXDR);
  return transactionXDR;
}





// Key pairs
const issuerId = StellarSdk.Keypair.fromPublicKey("GBRUR36MTLWC3MKUXPOCRLWQI52EBIGI7AF76LEDOFW4J5BGTTIXLCSN");
const issuerKeys = StellarSdk.Keypair.fromSecret("SDGQ3JNOVMT54GXQ7FFMUJCWJQ7XSUEFXAPNYCS34NHQLPI3VJJROLNT");

const distributionId = StellarSdk.Keypair.fromPublicKey("GA77G6NXBORRV2AODCZYWTKRMOKYHIGSBP6LPM3CIKLUJLEEKDNDBYDI");
const distributionKey = StellarSdk.Keypair.fromSecret("SBT7TDTSSBW2N65LANJB2BLMII3VYBPDTUFCGJSHLPNHUFDENQ5L2VBM");

// Assets
const DMMKAsset = new StellarSdk.Asset("DMMK", issuerId.publicKey());
const nUSDTAsset = new StellarSdk.Asset("nUSDT", issuerId.publicKey());

// Execute the combined transaction
executeCombinedTransaction(issuerId, issuerKeys, distributionId, distributionKey, DMMKAsset, nUSDTAsset)
  .then(XDR => {
    console.log("Transaction Envelope XDR: ", XDR);
  })
  .catch(error => {
    console.error("Transaction failed:", error);
    if (error.response.data.extras.result_codes) {
        console.log(error.response.data.extras.result_codes);
      }
  });
