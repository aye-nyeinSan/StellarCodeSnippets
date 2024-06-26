import * as StellarSdk from "@stellar/stellar-sdk";
import crypto from "crypto";
import { changeTrust , allowTrust,IssuerAccountSetOptions,SendPayments } from "../src/addingTrustLine.js";
import { getAccount } from "../src/getaccountInfo.js";

const memostring = "test memo hash";
const hash = crypto.createHash("sha256");
hash.update(memostring);
const hashValue = hash.digest();
const hexHash = hashValue.toString("hex");

var issuerId = StellarSdk.Keypair.fromPublicKey("GBRUR36MTLWC3MKUXPOCRLWQI52EBIGI7AF76LEDOFW4J5BGTTIXLCSN");
var issuerKeys = StellarSdk.Keypair.fromSecret("SDGQ3JNOVMT54GXQ7FFMUJCWJQ7XSUEFXAPNYCS34NHQLPI3VJJROLNT");

var distributionId = StellarSdk.Keypair.fromPublicKey("GA77G6NXBORRV2AODCZYWTKRMOKYHIGSBP6LPM3CIKLUJLEEKDNDBYDI");
var distributionKey = StellarSdk.Keypair.fromSecret("SBT7TDTSSBW2N65LANJB2BLMII3VYBPDTUFCGJSHLPNHUFDENQ5L2VBM")

//DMMKAsset
const DMMKAsset = new StellarSdk.Asset("DMMK",issuerId.publicKey())




try {
   
  const result = await  SendPayments(distributionId,distributionKey,issuerId,DMMKAsset,"600")
  
console.log(result);
  

 

} catch (error) {
  if (error instanceof StellarSdk.NotFoundError) {
    throw new Error("Your distribution account is not found!");
  } else if (error instanceof StellarSdk.NetworkError) {
    throw new Error("Something wrong with the network!");
  } else {
    console.log("Error occurred:", error);
    if (error.response.data.extras.result_codes) {
      console.log(error.response.data.extras.result_codes);
    }

  }
}


