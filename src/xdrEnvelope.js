import * as StellarSdk from "@stellar/stellar-sdk";
import { changeTrust,allowTrust,SendPayments } from "../src/addingTrustLine.js";


var issuerId = StellarSdk.Keypair.fromPublicKey("GBRUR36MTLWC3MKUXPOCRLWQI52EBIGI7AF76LEDOFW4J5BGTTIXLCSN");
var issuerKeys = StellarSdk.Keypair.fromSecret("SDGQ3JNOVMT54GXQ7FFMUJCWJQ7XSUEFXAPNYCS34NHQLPI3VJJROLNT");

var distributionId = StellarSdk.Keypair.fromPublicKey("GA77G6NXBORRV2AODCZYWTKRMOKYHIGSBP6LPM3CIKLUJLEEKDNDBYDI");
var distributionKey = StellarSdk.Keypair.fromSecret("SBT7TDTSSBW2N65LANJB2BLMII3VYBPDTUFCGJSHLPNHUFDENQ5L2VBM");

 
//DMMKAsset
const DMMKAsset = new StellarSdk.Asset("DMMK",issuerId.publicKey())
const nUSDTAsset = new StellarSdk.Asset("nUSDT",issuerId.publicKey())


const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const disAccount = await server.loadAccount(distributionId.publicKey());
disAccount.balances.forEach( async balance =>{
 if (balance.asset_code === DMMKAsset.code && balance.asset_issuer === issuerId.publicKey()) {
   console.log('This account have already registered assetCode from the issuer.');

    // 1. Payment Operation of 3,000 Ks from client to backend agent account ( 3 DMMK)
    await SendPayments(issuerId,issuerKeys,distributionId,DMMKAsset,"3")

    // 2. Payment Operation of 1.5 XLM from backend agent account
    await SendPayments(issuerId,issuerKeys,distributionId,StellarSdk.Asset.native(),"1.5")

   // 3. Change Trust Operation to add nUSDT trustline with limit 10,000
   await changeTrust(distributionId,distributionKey,nUSDTAsset,"10000")

   // 4. Set Trustline Flags Operation to approve nUSDT trustline
   const xdr = await allowTrust (issuerId,issuerKeys,distributionId,nUSDTAsset.code)

   console.log("Envelope_xdr: ",xdr.envelope_xdr);

   //Backend Agent will sign and send the XDR envelope to the client
   
}
else{
    console.log("You need to make trustline with issuer account.");
}
})


     







   