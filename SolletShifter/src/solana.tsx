// Import necessary modules from solana/web3.js
import React, { useState, useEffect } from 'react';
import { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

const SolanaWalletBalance: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [secretKey, setSecretKey] = useState<string>('');

  // This would be replaced with the actual method to obtain a secret key or Keypair
  const getKeypair = () => {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
  };

  const fetchBalance = async () => {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const keypair = getKeypair();
      const walletBalance = await connection.getBalance(keypair.publicKey);
      setBalance(walletBalance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (secretKey) {
      fetchBalance();
    }
  }, [secretKey]);

  return (
    <div>
      <h2>Solana Wallet Balance</h2>
      <input
        type="text"
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
        placeholder="Enter secret key as JSON array"
      />
      <button onClick={fetchBalance}>Get Balance</button>
      {balance !== null && <p>Balance: {balance} SOL</p>}
    </div>
  );
};

export default SolanaWalletBalance;
