import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMintToInstruction } from "@solana/spl-token";
import { createInstructionData, getGovernanceProgramVersion, withInsertTransaction } from '@solana/spl-governance';
import { connection, programId } from '../Tools/env';

export const createProposalInstruction = async (ownerPk: PublicKey, mintPk: PublicKey, tokenOwnerRecordPk: PublicKey, governancePk: PublicKey, governanceAuthority: PublicKey, ataPk: PublicKey, proposalPk: PublicKey, mintAuthorityPk: PublicKey, amount: number = 10000000) => {
    const signers: Keypair[] = [];
    const instructions: TransactionInstruction[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    const instruction = createMintToInstruction(
        mintPk,
        ataPk,
        mintAuthorityPk,
        amount,
        [],
        TOKEN_PROGRAM_ID
    );

    const instructionData = createInstructionData(instruction);

    await withInsertTransaction(
        instructions,
        programId,
        programVersion,
        governancePk,
        proposalPk,
        tokenOwnerRecordPk,
        governanceAuthority, // governanceAuthority
        0,
        0,
        0,
        [instructionData, instructionData],
        ownerPk,
    );

    return {
        signers: signers,
        instructions: instructions
    };
}