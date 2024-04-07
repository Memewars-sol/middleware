import {
    PublicKey, TransactionInstruction, Keypair
} from '@solana/web3.js';
import { withCreateAssociatedTokenAccount } from '../Tools/withCreateAssociatedTokenAccount';
import { withMintTo } from '../Tools/withMintTo';
import { connection } from '../Tools/env';
import { sendTransaction } from '../Tools/sdk';
import { RealmData } from '../types';
import fs from 'fs-extra';
import appRootPath from 'app-root-path';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const mintToken = async(ownerPk: PublicKey, mintPk: PublicKey, mintAmount: number = 1000000) => {
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    // create associated token account instruction
    let ataPk = await withCreateAssociatedTokenAccount(
        instructions,
        mintPk, // token address
        ownerPk, // owner
        ownerPk // payerPk
    );

    await withMintTo(instructions, mintPk, ataPk, ownerPk, mintAmount);

    // both mintAuthority and owner have to sign
    // signers.push(owner);
    // signers.push(mintAuthority);

    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}
