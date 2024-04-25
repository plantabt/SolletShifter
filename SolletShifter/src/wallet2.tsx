import React, { useState } from 'react';
import {  Connection, Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';


const WalletBalance: React.FC = () => {
    const [mnemonic, setMnemonic] = useState<string>('');
    const [balance, setBalance] = useState<string | null>(null);

    const getWalletBalance = async () => {
        //try {
            console.log(mnemonic);
            const seed = await bip39.mnemonicToSeedSync(mnemonic);
            console.log(`seed:${seed}`);
            const keypair = Keypair.fromSeed(seed.slice(0, 32));
            console.log(`111111111111111`);
            //
            //const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

            const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/alcht_r9gUZZ9NEe7YO06VQ265LJqxsACIWl', 'confirmed');
            console.log(`publickey:${keypair.publicKey}`);
            const walletBalance = await connection.getBalance(keypair.publicKey);
            console.log(`balance:${walletBalance}`);
            setBalance((walletBalance / 1e9).toString() + ' SOL');  // Convert lamports to SOL
       // } catch (error) {
       //     console.error('Error getting wallet balance:', error);
       //     setBalance('Error fetching balance');
       // }
    };

    return (
        <div>
            <input
                type="text"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12-word mnemonic"
            />
            <button onClick={getWalletBalance}>Get Balance</button>
            {balance !== null && <p>Balance: {balance}</p>}
        </div>
    );
};

export default WalletBalance;
