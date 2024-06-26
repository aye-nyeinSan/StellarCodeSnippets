import * as StellarSdk from "@stellar/stellar-sdk";
 // Horizon server instance
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

//If other accounts wants to hold asset,they need permission from issuer 
export async function IssuerAccountSetOptions(issuerId,issuerKey) {
  const issuer = await server.loadAccount(issuerId.publicKey());
  const transaction = new StellarSdk.TransactionBuilder(issuer, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
  .addOperation(
    StellarSdk.Operation.setOptions({
      setFlags: StellarSdk.AuthRequiredFlag
      // clearFlags: StellarSdk.AuthRequiredFlag
    })
  )
  .setTimeout(180)
  .build()

// sign transaction
transaction.sign(issuerKey)

// submit to server
return await server.submitTransaction(transaction)
console.log('[main] asset has been enable AUTHORIZATION_REQUIRED flag')
}

//change Trustline
export async function changeTrust(disaccount,disaccountKey,asset,limit) {
    const distributionAccount = await server.loadAccount(disaccount.publicKey());
    // Add trust line operation
    const changeTrust = new StellarSdk.TransactionBuilder(distributionAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: asset,
        limit: limit
      })
    )
    .setTimeout(30000) // Set timeout in milliseconds
    .build();
    changeTrust.sign(disaccountKey);
  
    const trustResult = await server.submitTransaction(changeTrust);
    console.log("Trust line added successfully:", trustResult);
    return trustResult
} 

 // Allow to hold custom asset
export async function allowTrust(issuerId,issuerKey,distributionId,assetCode) {
  const issuer = await server.loadAccount(issuerId.publicKey());
  const distributionAccount = await server.loadAccount(distributionId.publicKey());

    const allowTrustTransaction = new StellarSdk.TransactionBuilder(issuer, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
  .addOperation(
    StellarSdk.Operation.allowTrust({
      trustor: distributionAccount.account_id,
      assetCode: assetCode,
      authorize: true,
     
    })
  )
  .setTimeout(3000)
  .build();

  allowTrustTransaction.sign(issuerKey);
  return await server.submitTransaction(allowTrustTransaction);
  console.log('[main] issuer allows trust for distributor');
  

}

export async function SendPayments(issuerId,issuerKey,distributionId,assetCode,amount){
  const issuer = await server.loadAccount(issuerId.publicKey());
  const distributionAccount = await server.loadAccount(distributionId.publicKey());
   //Issue Asset to Distributor
 const IssuerToDisTransaction= new StellarSdk.TransactionBuilder(issuer,{
  fee: StellarSdk.BASE_FEE,
  networkPassphrase: StellarSdk.Networks.TESTNET
})
.addOperation(
  StellarSdk.Operation.payment({
    destination: distributionAccount.id,
    asset: assetCode,
    amount: amount,
    
  })
)
.setTimeout(180)
.build();
IssuerToDisTransaction.sign(issuerKey)
const issueToDisResult= await server.submitTransaction(IssuerToDisTransaction);
console.log("Sent Money From Issuer to Distributor: ", issueToDisResult);
return issueToDisResult
}

