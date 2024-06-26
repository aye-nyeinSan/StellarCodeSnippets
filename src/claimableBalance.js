import * as StellarSdk from '@stellar/stellar-sdk';

// Horizon server instance
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

var issuer = StellarSdk.Keypair.fromPublicKey("GA77G6NXBORRV2AODCZYWTKRMOKYHIGSBP6LPM3CIKLUJLEEKDNDBYDI");
var issuerKeys = StellarSdk.Keypair.fromSecret("SBT7TDTSSBW2N65LANJB2BLMII3VYBPDTUFCGJSHLPNHUFDENQ5L2VBM");
var destinationId = StellarSdk.Keypair.fromPublicKey("GAWNHK6EHUC62BJ4ZQH4H6TYLYVOATG5XQFZRBL3B3BLCTQ33WZ34DKX");
var destinationKey = StellarSdk.Keypair.fromSecret("SBXREVWD5DMHCO23BHJCCHTQ3F2RCUQU37NUVL3ZXJWMORZU6Z2D23QX")

//Sending claimable balance
export async function SendingclaimableBalance(issuer,issuerKeys,destination,balance,asset) {
    try {
        const accountA = await server.loadAccount(issuer.publicKey()) 
        const accountB = await server.loadAccount(destination.publicKey())
        let soon = Math.ceil(Date.now() / 1000 + 180); // .now() is in ms 
        let bCanClaim = StellarSdk.Claimant.predicateBeforeRelativeTime("180");//within 180 secs(3mins) from Now
        let aCanReclaim = StellarSdk.Claimant.predicateNot(
          StellarSdk.Claimant.predicateBeforeAbsoluteTime(soon.toString()),
        )
          // Create the operation and submit it in a transaction.
  let claimableBalanceEntry = StellarSdk.Operation.createClaimableBalance({
    claimants: [
      new StellarSdk.Claimant(accountB.account_id, bCanClaim),
      new StellarSdk.Claimant(accountA.account_id, aCanReclaim),
    ],
    asset: asset,
    amount: balance,
  });
  let tx = new StellarSdk.TransactionBuilder(accountA, { fee: StellarSdk.BASE_FEE })
  .addOperation(claimableBalanceEntry)
  .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
  .setTimeout(180)
  .build();

  tx.sign(issuerKeys);
  let response = await server.submitTransaction(tx)
  
  console.log("Claimable balance created!", response);

//Claiming Claimable Balances
  let balances=  await server.claimableBalances()
    .claimant(accountB.account_id)
    .limit(1) // there may be many in general
    .order("desc") // so always get the latest one
    .call()

let balanceId = balances.records[0].id;
console.log("Balance ID :", balanceId);
let claimBalance =  StellarSdk.Operation.claimClaimableBalance({
    balanceId: balanceId,
  });
  

  console.log(accountB.id, " is claiming", balanceId);
  //claiming claimable Balance Transcation
  let claimingTx = new StellarSdk.TransactionBuilder(accountB, { fee: StellarSdk.BASE_FEE })
  .addOperation(claimBalance)
  .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
  .setTimeout(180)//3mins
  .build();
  claimingTx.sign(destinationKey);
   await server.submitTransaction(claimingTx)
  .then((res)=>{console.log("Claimed: ", res)})
  .catch(function (err) {
    console.error(`Tx submission failed: ${err}`);
   
  });

    } catch (error) {
     
        console.log(error);
        if(error.response.data.extras.result_codes)
        {console.log(error.response.data.extras.result_codes);}
    }
    
}

SendingclaimableBalance(issuer,issuerKeys,destinationId,"200",StellarSdk.Asset.native())