import { MintLayout, TOKEN_PROGRAM_ID, createInitializeMintInstruction } from '@solana/spl-token';
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js';

export const withCreateMint = async (
    connection: Connection,
    instructions: TransactionInstruction[],
    signers: Keypair[],
    ownerPk: PublicKey,
    freezeAuthorityPk: PublicKey | null,
    decimals: number,
    payerPk: PublicKey
) => {
    const mintRentExempt = await connection.getMinimumBalanceForRentExemption(
        MintLayout.span
    );

    const mintAccount = new Keypair();

    instructions.push(
        SystemProgram.createAccount({
            fromPubkey: payerPk,
            newAccountPubkey: mintAccount.publicKey,
            lamports: mintRentExempt,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID,
        })
    );

    signers.push(mintAccount);

    instructions.push(
        createInitializeMintInstruction(
            mintAccount.publicKey,
            decimals,
            ownerPk,
            freezeAuthorityPk,
        )
    );

    return mintAccount.publicKey;
};
