import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as bip39 from "bip39"
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";

//import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { ethers } from "ethers";
export class WalletSupport {
  /*
  public static async  fetchTokens() {
    const { value } = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, { programId: TOKEN_PROGRAM_ID });
    return value.map(accountInfo => ({
      mint: accountInfo.account.data.parsed.info.mint,
      balance: accountInfo.account.data.parsed.info.tokenAmount.uiAmount,
      address: accountInfo.pubkey.toString(),
    }));
  }*/
  public static async findAndListTokens(mnemonic: string): Promise<void> {
    // 获取所有token账户
    if (!bip39.validateMnemonic(mnemonic)) {
      console.log('无效的助记词');
      return;
    }
    const derivationPath = "m/44'/501'/0'/0'";  // 根据需要修改路径
    const seed1 = await bip39.mnemonicToSeed(mnemonic);
    const { key } = derivePath(derivationPath, seed1.toString('hex'));
    const keypair1 = Keypair.fromSeed(key.slice(0, 32));
    
    console.log("Public Key:", keypair1.publicKey.toString());
    return;

    console.log(mnemonic);
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/alcht_r9gUZZ9NEe7YO06VQ265LJqxsACIWl', 'confirmed');
    const seed = await bip39.mnemonicToSeedSync(mnemonic);
    //const seed = await bip39.mnemonicToSeed(mnemonic);
    //let publicKey = Keypair.fromSeed(seed.slice(0,32)).publicKey;


  
    // create keypairs
 

    const keypair = Keypair.fromSeed(seed.slice(0,32));
    let publicKey = keypair.publicKey;
    let secretKeyArray = keypair.secretKey.toString().split(",");
    console.log(`secretKey:${keypair.secretKey.toString()}`);
    const numberArray = secretKeyArray.map(Number);

    // 从数字数组创建Uint8Array
    const seed2 = Uint8Array.from(numberArray).slice(0, 32);
    

    //let seed2 = Uint8Array.from(pkey).slice(0, 32);
    //const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
    //const publicKey = new PublicKey(derivedSeed);

    // 获取公钥
  
    console.log(Keypair.fromSeed(seed2).publicKey.toString());
    const walletBalance = await connection.getBalance(publicKey);
    console.log(`walletBalance:${walletBalance}`);

    const {value} = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID, });
    console.log(`tokenAccounts:${value}`);
      // 遍历所有token账户，获取余额和代币信息
      for (const { account } of value) {
        let tokenAccountInfo = account.data.parsed.info;
        let tokenAmount = tokenAccountInfo.tokenAmount.uiAmount;
        let tokenMint = tokenAccountInfo.mint;
    
        console.log(`Token Mint: ${tokenMint}, Balance: ${tokenAmount}`);
      }
      
  }
  public static async CreateMnemonic():Promise<string> {
    return await bip39.generateMnemonic()
  }
  public static async GetPrivateKey(mnemonic: string):Promise<Uint8Array> {
    let seed = await bip39.mnemonicToSeedSync(mnemonic);
    return Keypair.fromSeed(seed.slice(0, 32)).secretKey;
  }
  public static async GetSolanaPubKey(mnemonic: string):Promise<string> {
    let seed = await bip39.mnemonicToSeedSync(mnemonic);
    return Keypair.fromSeed(seed.slice(0, 32)).publicKey.toString();
  }
  public static async generatePolygonPublicKey(mnemonic: string): Promise<string> {
    return await WalletSupport.generateEthereumPublicKey(mnemonic);
  }
  public static async generateEthereumPublicKey(mnemonic: string): Promise<string> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const hdWallet = ethers.HDNodeWallet.fromSeed(seed);
    const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0");
    return wallet.address.toString();
  }
}