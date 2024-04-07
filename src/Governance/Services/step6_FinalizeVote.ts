import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { Proposal, getGovernanceProgramVersion } from '@solana/spl-governance';

import { withFinalizeVote } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const finalizeVote = async (
    realmPk: PublicKey,
    ownerPk: PublicKey,
    proposal: ProgramAccount<Proposal>,
) => {
    let signers: Keypair[] = [];
    let instructions: TransactionInstruction[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    await withFinalizeVote(
        instructions,
        programId,
        programVersion,
        realmPk,
        proposal.account.governance,
        proposal.pubkey,
        proposal.account.tokenOwnerRecord,
        proposal.account.governingTokenMint,
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
};
