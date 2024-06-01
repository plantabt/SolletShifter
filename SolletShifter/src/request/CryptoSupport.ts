import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as bip39 from "bip39"
import { derivePath } from "ed25519-hd-key";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
//import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { ethers } from "ethers";
import { Metaplex } from '@metaplex-foundation/js';
import { HttpReqeust } from "./HttpReqeust";
import {LoginRequest, RegisterRequest, QueryBalance} from "./common";
import bs58 from 'bs58';
export interface MintInfo{
  name:string;
  balance:number;
  token:string;
}
export interface TansferInfo{
  datetime:string,
  sender_authority:string,
  sender: string,
  recipient: string,
  mint:string,
  mintname:string,
  amount: string
}
//const _net = 'https://misty-responsive-wave.solana-mainnet.quiknode.pro/0b50ba41d8f8b72d90d19ed02a447598a5025036/'
const _net =  'https://solana-mainnet.g.alchemy.com/v2/alcht_r9gUZZ9NEe7YO06VQ265LJqxsACIWl';
export class CryptoSupport {
  public static async requestBalance(server:any,reqBalanceData:QueryBalance){
    let url = server+"/account/api/balance";
    HttpReqeust.PostData(url, reqBalanceData)
    .then(data => {
      return data; // 从服务器解析的 JSON 数据
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  }

  public static async RegisterAccount(server:string,regData:RegisterRequest) {
    let url = server+"/account/api/register";

    return await HttpReqeust.post(url,regData);
  }

  public static async Login(server:string, regData:LoginRequest) {
    let url = server+"/account/api/login";
    return await HttpReqeust.post(url,regData);
  }

  public static async balance(server:string, regData:QueryBalance) {
    let url = server+"/account/api/balance";
    return await HttpReqeust.post(url,regData);
  }

  public static async requestRecentTransfer(server:any,phrase:any,privekey:any=""):Promise<any>{
    let url = server+"/account/api/rttransfer";
    let transactions=null;
    await HttpReqeust.PostData(url, { phrase:phrase,privekey:privekey})
    .then(data => {
      transactions = JSON.parse(data.data);
      //console.log(trans[0].datetime);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    return transactions;
  }
  public static async getTokenName(mintAddress:string):Promise<string> {
    const connection = new Connection(_net, 'confirmed');
  
    const mintPublicKey = new PublicKey(mintAddress);
    const metaplex = Metaplex.make(connection);

    const metadataPda = metaplex.nfts().pdas().metadata({ mint: mintPublicKey });
    const account = await Metadata.fromAccountAddress(connection, metadataPda);
    
    //console.log("Metadata:",account);
    /*console.log('Name', account.data.name.replace(/\u0000/g, ''))
    console.log('Symbol', account.data.symbol.replace(/\u0000/g, ''))
    console.log('URI', account.data.uri.replace(/\u0000/g, ''))
    */
    return account.data.name.replace(/\u0000/g, '');

  }
  public static async  GetTransactionDetails (mnemonic:string):Promise<TansferInfo[]>{
    let transferInfo = new Array<TansferInfo>();
    const connection = new Connection(_net, 'confirmed');
  
    const publicKey = await CryptoSupport.GetSolanaPubKey(mnemonic);
   
    const recentSignatures = await connection.getSignaturesForAddress(publicKey, {}, "confirmed");
    
    // recentSignatures.slice(0, 10) Recently 10 times transfer informatin.
    const transactionPromises = recentSignatures.slice(0, 10).map(signature =>
      connection.getParsedTransaction(signature.signature)
    );
  
    const recentTransactions = await Promise.all(transactionPromises);
    console.log("RecentTransactions:",recentTransactions);

    
    recentTransactions.forEach(tx => {
      if (tx && tx.transaction && tx.meta) {
        console.log(`Transaction fee: ${tx.meta.fee / LAMPORTS_PER_SOL} SOL`);
        tx.transaction.message.instructions.forEach(async (instruction) => {
          if (('parsed' in instruction) && instruction.program === "spl-token") {
            if('tokenAmount' in instruction.parsed.info){
              const blockTime = tx.blockTime==null?0:tx.blockTime;
              const dateTime = new Date(blockTime * 1000).toISOString();
              let mintname = await CryptoSupport.getTokenName(instruction.parsed.info.mint);
              let tokenAmount = instruction.parsed.info.tokenAmount;
              transferInfo.push({
                datetime:dateTime,
                sender_authority:instruction.parsed.info.authority,
                sender: instruction.parsed.info.source,
                recipient: instruction.parsed.info.destination,
                mint:instruction.parsed.info.mint,
                mintname:mintname,
                amount: tokenAmount.uiAmount.toString()
              });
              let ctf = transferInfo[transferInfo.length-1];
              if(ctf.sender_authority==publicKey.toString()){
                console.log(`Date:${ctf.datetime} Authority:${ctf.sender_authority} \r\nTransfer from ${ctf.sender} to ${ctf.recipient} of [${ctf.mintname}] -${ctf.amount}`);
              }else{
                console.log(`Date:${ctf.datetime} Authority:${ctf.sender_authority} \r\nTransfer from ${ctf.sender} to ${ctf.recipient} of [${ctf.mintname}] +${ctf.amount}`);
              }
              
            }
          }
        });
      }
    });
    return transferInfo;
  };


  public static async fetchTransactions(mnemonic:string) {
  
    const connection = new Connection(_net, "confirmed");

    // 假设这是你的公钥
    const publicKey = await CryptoSupport.GetSolanaPubKey(mnemonic);

    // 获取最近的签名信息
    const recentSignatures = await connection.getSignaturesForAddress(publicKey, {}, "confirmed");

    // 从签名信息获取交易详情
    const transactionPromises = recentSignatures.slice(0, 10).map(signature =>
      connection.getTransaction(signature.signature)
    );

    const recentTransactions = await Promise.all(transactionPromises);
    console.log("recentTransactions:",recentTransactions);

    const exclude=["ComputeBudget111111111111111111111111111111","11111111111111111111111111111111"];
    recentTransactions.forEach(tx => {
      if (tx && tx.transaction.message && tx.meta) {
        let preBalances = tx.meta?.preBalances;
        let postBalances = tx.meta?.postBalances;
        console.log(tx.transaction);
        tx.transaction.message.instructions.forEach((instruction, index) => {
          const programId = tx.transaction.message.accountKeys[instruction.programIdIndex].toString();
          const blockTime = tx.blockTime==null?0:tx.blockTime;
          const dateTime = new Date(blockTime * 1000).toISOString();
          if(!programId.includes(exclude[0]) && !programId.includes(exclude[1])){
            console.log("programId:",programId);
          
         // if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") { // This is the program ID for the SPL Token program
            const keys = instruction.accounts.map(account => tx.transaction.message.accountKeys[account].toString());
            const transferInfo = {
              sender: keys[0], // assuming the sender is the first account
              recipient: keys[1], // assuming the recipient is the second account
              amount: (preBalances[index] - postBalances[index]) / LAMPORTS_PER_SOL + ' SOL'
            };
            console.log(`Transfer from ${transferInfo.sender} to ${transferInfo.recipient} of ${transferInfo.amount} date:${dateTime}`);
          //}
          }
        });
      }
    });
    /*
    
    recentTransactions.forEach(tx => {
      // Assuming it's a simple transfer transaction
      if (tx && tx.meta) {
        const transactionDetails = {
          fee: (tx.meta?.fee!=undefined? tx.meta?.fee/ LAMPORTS_PER_SOL:0) + ' SOL',
          preBalances: tx.meta?.preBalances.map(balance => balance / LAMPORTS_PER_SOL + ' SOL'),
          postBalances: tx.meta?.postBalances.map(balance => balance / LAMPORTS_PER_SOL + ' SOL'),
          status: tx.meta
        };
  
        console.log("TransactionDetails:",transactionDetails);
        
        // To find sender and recipient, we would need to examine the transaction instructions
        tx.transaction.message.instructions.forEach(instruction => {
          console.log("Instruction:",instruction);
          // Here you can parse the instruction to find further details about sender, recipient, and transferred amounts
        });
        
      }
    });
    */
    
  };

  public static async GetSolanaMints(mnemonic: string): Promise<MintInfo[]> {
    // 获取所有token账户
    if (!bip39.validateMnemonic(mnemonic)) {
      console.log('无效的助记词');
      return new Array<MintInfo>();
    }
    CryptoSupport.GetTransactionDetails(mnemonic);
    console.log(_net);
    console.log("Mnemonic:", mnemonic);
    const publicKey =await CryptoSupport.GetSolanaPubKey(mnemonic);
    //let publicKey = keypair.publicKey;
    console.log("Public bytes:", publicKey.toBytes());
    console.log("Public Key:", publicKey.toString());
    
    const connection = new Connection(_net, 'confirmed');
    

    let MintList = new Array<MintInfo>();
    const values = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID, });
    console.log(values);
      // 遍历所有token账户，获取余额和代币信息
      for (const { account } of values.value) {
        let tokenAccountInfo = account.data.parsed.info;
        let tokenAmount = tokenAccountInfo.tokenAmount.uiAmount;
        let tokenMint = tokenAccountInfo.mint;
        console.log(tokenAccountInfo);
        //console.log(`Token Mint: ${tokenMint}, Balance: ${tokenAmount}`);
        let mintname = await CryptoSupport.getTokenName(tokenMint);
        MintList.push({name:mintname,balance:tokenAmount,token:tokenMint});
      }
      return MintList;
   

  }
  public static async CreateMnemonic():Promise<string> {
    return await bip39.generateMnemonic()
  }


  public static async GetSolanaKeypair(mnemonic: string):Promise<Keypair> {
    const derivationPath = "m/44'/501'/0'/0'";  // 根据需要修改路径
    const seed = await bip39.mnemonicToSeed(mnemonic);  
    const  derive  = derivePath(derivationPath, seed.toString('hex'));
    return Keypair.fromSeed(derive.key.slice(0, 32));
  }
  public static async GenerateSolanaPrivateKey(mnemonic: string):Promise<string> {
    let keypair = await this.GetSolanaKeypair(mnemonic);
    let secretKey = keypair.secretKey;
    let hexString = bs58.encode(secretKey);
    return hexString;
  }

  public static async GetSolanaPubKey(mnemonic: string):Promise<PublicKey> {
    let keypair = await this.GetSolanaKeypair(mnemonic);
    return keypair.publicKey;
  }
  public static async generatePolygonPublicKey(mnemonic: string): Promise<string> {
    return await CryptoSupport.generateEthereumPublicKey(mnemonic);
  }
  public static async generateEthereumPublicKey(mnemonic: string): Promise<string> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const hdWallet = ethers.HDNodeWallet.fromSeed(seed);
    const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0");
    return wallet.address.toString();
  }
}