import {
    Keypair
} from '@solana/web3.js';
import { getGovernanceProgramVersion, withWithdrawGoverningTokens } from '@solana/spl-governance';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';


export const withdrawAllGoverningTokens = async (
    realmPk: PublicKey,
    ownerPk: PublicKey,
    governingTokenDestination: PublicKey,
    governingTokenMint: PublicKey,
) => {
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    await withWithdrawGoverningTokens(
        instructions,
        programId,
        programVersion,
        realmPk,
        governingTokenDestination,
        governingTokenMint,
        ownerPk,
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
};
