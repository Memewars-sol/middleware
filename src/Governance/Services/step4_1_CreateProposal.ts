import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import { MultiChoiceType, VoteType, getGovernanceProgramVersion, withAddSignatory, withCreateProposal } from '@solana/spl-governance';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const createProposal = async(realmPk: PublicKey, ownerPk: PublicKey, mintPk: PublicKey, tokenOwnerRecordPk: PublicKey, governancePk: PublicKey, governanceAuthorityPk: PublicKey, title: string, description: string, voteOptions: string[] = ['Approve'], useDenyOption: boolean = true, singleOrMultiVote: 'single' | 'multiple' = 'single') => {
    const signers: Keypair[] = [];
    const instructions: TransactionInstruction[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    //  realm / governance owner
    // const governanceAuthorityKP = Keypair.fromSecretKey(bs58.decode(getTokenAuthoritySecret()));
    // signers.push(governanceAuthorityKP);

    // Create single choice Approve/Deny proposal with instruction to mint more governance tokens
    // Create multi-choice proposal
    const voteType = singleOrMultiVote === 'single' ? VoteType.SINGLE_CHOICE : VoteType.MULTI_CHOICE(MultiChoiceType.FullWeight, 1, 10, 1);

    // const allProposal = await getAllProposalsData(realmPk);
    // let proposalSize = 0;

    // _.map(allProposal, (proposal) => {
    //     if (!_.isEmpty(proposal)) {
    //         proposalSize++;
    //     }
    // });
    // console.log(`proposalSize: ${proposalSize}`);
    const proposalPk = await withCreateProposal(
        instructions,
        programId, // governance contract
        programVersion,
        realmPk,
        governancePk,
        tokenOwnerRecordPk,
        title, // title
        description, // description
        mintPk, // governance token
        ownerPk, // governance authority (Stucked here for many days, it should be the owner of the proposal creator)
        undefined, // proposal index (increase+1 for new proposal)
        voteType, // single / multiple
        voteOptions,
        useDenyOption,
        ownerPk, // payer
    );

    // Add the proposal creator as the default signatory (It is compulsory if you want a complex governance)
    // const signatoryRecordPk = await withAddSignatory(
    //     instructions,
    //     programId,
    //     programVersion,
    //     proposalPk,
    //     tokenOwnerRecordPk,
    //     ownerPk, //     governanceAuthorityPk,
    //     ownerPk, //signatory,
    //     ownerPk, // payer
    // );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return {
        data: serializedTransaction,
        details: {
            proposalPk: proposalPk.toBase58(),
            signatoryRecordPk: ""
            // signatoryRecordPk: signatoryRecordPk?.toBase58()
        }
    };
    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}