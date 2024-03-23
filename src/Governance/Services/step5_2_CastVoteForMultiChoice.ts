import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import {
    getGovernanceProgramVersion,
    withCastVote,
    Vote,
    VoteKind,
    getProposal,
    VoteChoice,
    YesNoVote,
} from '@solana/spl-governance';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const castVoteForMultiChoice = async(
    realmPk: PublicKey,
    ownerPk: PublicKey,
    mintPk: PublicKey,
    tokenOwnerRecordPk: PublicKey,
    governancePk: PublicKey,
    proposalPk: PublicKey,
    selectedOptionIndex: number = 0,
    voteDeny: boolean = false,
    voteVeto: boolean = false
) => {
    const instructions: TransactionInstruction[] = [];
    const signers: Keypair[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(connection, programId);

    // const proposalData = await getProposal(connection, proposalPk);
    // // Assuming proposalData contains the options as shown in your previous message
    // const approveChoices = proposalData.account.options.map((option, index) => ({
    //     label: option.label,
    //     index: index  // or however you need to reference the choice in the vote
    // }));

    const selectedChoices: VoteChoice[] = [new VoteChoice({ rank: selectedOptionIndex, weightPercentage: 100 })];

    // Construct the vote object for a specific option
    let vote = new Vote({
        voteType: VoteKind.Approve,
        approveChoices: selectedChoices,
        deny: false,
        veto: false
    });

    // check for deny (second priority)
    vote = voteDeny ? Vote.fromYesNoVote(YesNoVote.No) : vote;

    // check for veto (highest priority)
    vote = voteVeto ? new Vote({
        voteType: VoteKind.Veto,
        approveChoices: undefined,  // Not applicable for a veto vote
        deny: undefined,  // Not applicable for a veto vote
        veto: true
    }) : vote;

    await withCastVote(
        instructions,
        programId,
        programVersion,
        realmPk,
        governancePk,
        proposalPk,
        tokenOwnerRecordPk,
        tokenOwnerRecordPk,
        ownerPk,
        mintPk,
        vote,
        ownerPk
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
};
