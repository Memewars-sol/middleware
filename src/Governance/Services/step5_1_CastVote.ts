import { Vote, VoteKind, YesNoVote, getGovernanceProgramVersion, withCastVote } from '@solana/spl-governance';
import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';


export const castVote = async(realmPk: PublicKey, ownerPk: PublicKey, mintPk: PublicKey, tokenOwnerRecordPk: PublicKey, governancePk: PublicKey, proposalPk: PublicKey, voteYesOrNo: boolean = true, voteVeto: boolean = false) => {
    // Cast Vote
    const instructions: TransactionInstruction[] = [];
    const signers: Keypair[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    let vote = voteYesOrNo ? Vote.fromYesNoVote(YesNoVote.Yes) : Vote.fromYesNoVote(YesNoVote.No);

    // veto will override normal vote
    vote = voteVeto ? new Vote({
        voteType: VoteKind.Veto,
        approveChoices: undefined,  // Not applicable for a veto vote
        deny: undefined,  // Not applicable for a veto vote
        veto: true
    }) : vote;

    const votePk = await withCastVote(
        instructions,
        programId,
        programVersion,
        realmPk, // realm
        governancePk, // governance
        proposalPk, // proposal
        tokenOwnerRecordPk, // Proposal owner TokenOwnerRecord
        tokenOwnerRecordPk, // Voter TokenOwnerRecord
        ownerPk, // Voter wallet or delegate
        mintPk,
        vote,
        ownerPk, // payer
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}