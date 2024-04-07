import * as fs from 'fs-extra';
import appRootPath from 'app-root-path';
import { requestAirdrop } from './sdk';
import dotenv from 'dotenv';
dotenv.config();
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { RpcTokenBalance } from '../types';
import axios from 'axios';
const connection = new Connection(process.env.RPC!);

// Define the path for the keypair file
const keypairFilePath: string[] = [
    appRootPath.resolve('wallet-keypair.json'),
    appRootPath.resolve('wallet-keypair2.json'),
];

const saveKeypairToFile = (keypair: Keypair, index: number = 0): void => {
    // Serialize the keypair
    const serializedKeypair: string = JSON.stringify(Array.from(keypair.secretKey));
    // Write the serialized keypair to the file
    fs.writeFileSync(keypairFilePath[index], serializedKeypair, 'utf8');
}

const loadKeypairFromFile = (index: number = 0): Keypair => {
    // Read the serialized keypair from the file
    const serializedKeypair: string = fs.readFileSync(keypairFilePath[index], 'utf8');
    // Deserialize the keypair
    const secretKey: Uint8Array = Uint8Array.from(JSON.parse(serializedKeypair));
    return Keypair.fromSecretKey(secretKey);
}

export const getBalance = async(walletAddress: PublicKey) => {
    // Get the balance
    const balance = await connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL; // Balance is in lamports (1 SOL = 1,000,000,000 lamports)
}

export const getTokenBalance = async (walletAddress: string, tokenAddress: string): Promise<RpcTokenBalance> => {
    const config = {
        url: process.env.RPC!,
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: [
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    walletAddress,
                    {
                        mint: tokenAddress,
                    },
                    {
                        encoding: "jsonParsed",
                    },
                ],
            },
        ]
    };

    return new Promise((resolve, reject) => {
        axios.request(config)
            .then((response) => {
                resolve(response.data[0]);
            })
            .catch((error) => {
                console.log(error);
                // resolve(null)
            });
    })
}


export const generateOrLoadKeypair = async(index: number = 0): Promise<Keypair> => {
    let wallet: Keypair;
    return new Promise(async(resolve, reject) => {
        // Check if the keypair file exists
        if (await fs.exists(keypairFilePath[index])) {
            // Load the keypair from the file
            wallet = loadKeypairFromFile(index);
        } else {
            // Generate a new keypair
            wallet = Keypair.generate();
            await requestAirdrop(connection, wallet.publicKey);
            // Save the keypair to the file
            saveKeypairToFile(wallet, index);
        }

        resolve(wallet);
    })
}

