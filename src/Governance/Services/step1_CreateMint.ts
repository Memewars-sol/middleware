import {
    Keypair,
    PublicKey
} from '@solana/web3.js';
import { connection } from '../Tools/env';
import { TransactionInstruction } from '@solana/web3.js';
import { withCreateMint } from '../Tools/withCreateMint';
import { sendTransaction } from '../Tools/sdk';
import { RealmData } from '../types';
import fs from 'fs-extra';
import appRootPath from 'app-root-path';
import { getSerializedTransactionInstructions } from '../Tools/serialize';
import bs58 from 'bs58';

export const createMint = async(ownerPk: PublicKey) => {
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    // Create and mint governance token instruction
    // and get mint pk
    let mintPk = await withCreateMint(
        connection,
        instructions,
        signers,
        ownerPk, // owner
        null, // ownerPk, // freeze authority
        0, // decimal
        ownerPk // payer
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}