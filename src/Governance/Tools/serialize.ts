import {
    PublicKey,
    Keypair,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';

import { connection } from './env';
import _ from 'lodash';
import { sendTransaction } from './sdk';

export async function getSerializedTransactionInstructions(
    instructions: TransactionInstruction[],
    signers: Keypair[],
    feePayer: PublicKey,
    sendTx: boolean = false,
    feePayerKeypair: Keypair | undefined = undefined,
): Promise<string> {
    const transaction = new Transaction();
    transaction.instructions = instructions;
    transaction.feePayer = feePayer;

    // Fetch recentBlockhash close to the transaction construction time
    transaction.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;

    console.log(`signers.length: ${signers.length}`);

    // Sign the transaction with the mintAccount only
    if (_.size(signers)) {
        transaction.partialSign(...signers);
    }

    if (!transaction) {
        throw new Error('Transaction is not undefined');
    }

    if (!sendTx) {
        // Serialize the transaction without signing
        const serializedTransaction = transaction.serialize({ requireAllSignatures: false });

        // transaction.partialSign(feePayer);
        // const signedSerialized = transaction.serialize({ requireAllSignatures: false });

        // console.log(`1 signer: ${serializedTransaction.toString('base64')}`);
        // console.log(`all signer: ${signedSerialized.toString('base64')}`);

        // Encode the serialized transaction as a base64 string
        const base64SerializedTransaction = serializedTransaction.toString('base64');

        return base64SerializedTransaction;
    } else {
        const tx = await sendTransaction(connection, transaction.instructions, signers, feePayerKeypair!);
        console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
        return `https://solscan.io/tx/${tx}?cluster=devnet`;
    }
}