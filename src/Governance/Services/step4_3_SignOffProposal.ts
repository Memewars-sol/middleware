import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import { InstructionData, getGovernanceProgramVersion, withSignOffProposal } from '@solana/spl-governance';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const signOffProposal = async(realmPk: PublicKey, ownerPk: PublicKey, tokenOwnerRecordPk: PublicKey, governancePk: PublicKey, proposalPk: PublicKey, signatoryPk: PublicKey, proposalInstructions: TransactionInstruction[] = []) => {
    const signers: Keypair[] = [];
    let instructions: TransactionInstruction[] = [];

    // merge instruction
    instructions = [...instructions, ...proposalInstructions];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    withSignOffProposal(
        instructions,
        programId,
        programVersion,
        realmPk, // realm
        governancePk, // governance
        proposalPk, // proposal
        signatoryPk, //signer
        undefined, // signer record
        tokenOwnerRecordPk, // proposal owner record / token owner record
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}