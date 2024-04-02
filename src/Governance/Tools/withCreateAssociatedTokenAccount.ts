import {
    // getAssociatedTokenAddress,
    // createAssociatedTokenAccountInstruction,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
} from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const withCreateAssociatedTokenAccount = async (
    instructions: TransactionInstruction[],
    mintPk: PublicKey,
    ownerPk: PublicKey,
    payerPk: PublicKey
) => {
    const ataPk = await getAssociatedTokenAddress(
        mintPk,
        ownerPk
    );

    instructions.push(
        createAssociatedTokenAccountInstruction(
            payerPk,
            ataPk,
            ownerPk,
            mintPk
        )
    );

    return ataPk;
};