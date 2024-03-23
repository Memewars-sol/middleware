import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const withCreateAssociatedTokenAccount = async (
    instructions: TransactionInstruction[],
    mintPk: PublicKey,
    ownerPk: PublicKey,
    payerPk: PublicKey,
    allowOwnerOffCurve = false, // Default to false, set to true if owner is a PDA
    programId = TOKEN_PROGRAM_ID, // Default to the standard TOKEN_PROGRAM_ID
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID // Default to the standard ASSOCIATED_TOKEN_PROGRAM_ID
) => {
    const ataPk = await getAssociatedTokenAddress(
        mintPk,
        ownerPk,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId
    );

    instructions.push(
        createAssociatedTokenAccountInstruction(
            associatedTokenProgramId,
            programId,
            mintPk,
            ataPk,
            ownerPk,
            payerPk
        )
    );

    return ataPk;
};