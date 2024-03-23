import { createMintToInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const withMintTo = async (
    instructions: TransactionInstruction[],
    mintPk: PublicKey,
    destinationPk: PublicKey,
    mintAuthorityPk: PublicKey,
    amount: number
) => {
    instructions.push(
        createMintToInstruction(
            mintPk,
            destinationPk,
            mintAuthorityPk,
            amount,
            [],
            TOKEN_PROGRAM_ID
        )
    );
}
