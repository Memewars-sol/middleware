import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import fs from 'fs-extra';
import appRootPath from 'app-root-path';
import { MultiChoiceType, VoteType, getGovernanceProgramVersion, withAddSignatory, withCreateProposal } from '@solana/spl-governance';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { RealmData } from '../types';
import { getSerializedTransactionInstructions } from '../Tools/serialize';
import { getAllProposalsData } from './step0_Query';
import _ from 'lodash';
import { getTokenAuthoritySecret } from '../../../utils';
import bs58 from 'bs58';

export const createProposal = async(realmPk: PublicKey, ownerPk: PublicKey, mintPk: PublicKey, tokenOwnerRecordPk: PublicKey, governancePk: PublicKey, governanceAuthorityPk: PublicKey, title: string, description: string, voteOptions: string[] = ['Approve'], useDenyOption: boolean = true, singleOrMultiVote: 'single' | 'multiple' = 'single') => {
    const signers: Keypair[] = [];
    const instructions: TransactionInstruction[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    // Create single choice Approve/Deny proposal with instruction to mint more governance tokens
    // Create multi-choice proposal
    const voteType = singleOrMultiVote === 'single' ? VoteType.SINGLE_CHOICE : VoteType.MULTI_CHOICE(MultiChoiceType.FullWeight, 1, 10, 1);

    const allProposal = await getAllProposalsData(realmPk);

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
        governanceAuthorityPk, // governance authority
        _.size(allProposal), // proposal index (increase+1 for new proposal)
        voteType, // single / multiple
        voteOptions,
        useDenyOption,
        ownerPk, // payer
    );

    // Add the proposal creator as the default signatory (It is compulsory if you want a complex governance)
    // await withAddSignatory(
    //     instructions,
    //     programId,
    //     programVersion,
    //     proposalPk,
    //     tokenOwnerRecordPk,
    //     ownerPk,
    //     ownerPk, //signatory,
    //     ownerPk,
    // );

    //  Create a keypair from the secret key
    const governanceAuthorityKP = Keypair.fromSecretKey(bs58.decode(getTokenAuthoritySecret()));
    signers.push(governanceAuthorityKP);

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return {
        data: serializedTransaction,
        details: {
            proposalPk: proposalPk.toBase58(),
        }
    };
    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}