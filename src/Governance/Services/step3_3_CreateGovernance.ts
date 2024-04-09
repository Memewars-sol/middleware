import { GovernanceConfig, MintMaxVoteWeightSource, SetRealmAuthorityAction, VoteThreshold, VoteThresholdType, VoteTipping, getGovernanceProgramVersion, withCreateMintGovernance, withCreateRealm, withDepositGoverningTokens, withSetRealmAuthority } from '@solana/spl-governance';
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { getTimestampFromDays } from '../Tools/units';
import { sendTransaction } from '../Tools/sdk';
import fs from 'fs-extra';
import appRootPath from 'app-root-path';
import { connection, programId } from '../Tools/env';
import { RealmData } from '../types';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const createGovernance = async (realmPk: PublicKey, ownerPk: PublicKey, mintPk: PublicKey, tokenOwnerRecordPk: PublicKey) => {
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    // Create governance over the the governance token mint
    let communityVoteThreshold = new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        value: 60,
    });

    let councilVoteThreshold = new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        // For VERSION < 3 we have to pass 0
        value: programVersion >= 3 ? 10 : 0,
    });

    let councilVetoVoteThreshold = new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        // For VERSION < 3 we have to pass 0
        value: programVersion >= 3 ? 10 : 0,
    });

    const config = new GovernanceConfig({
        communityVoteThreshold: communityVoteThreshold,
        minCommunityTokensToCreateProposal: new BN(1000),
        minInstructionHoldUpTime: 0,
        baseVotingTime: getTimestampFromDays(1),
        communityVoteTipping: VoteTipping.Early,
        councilVoteTipping: VoteTipping.Early,
        minCouncilTokensToCreateProposal: new BN(1),
        councilVoteThreshold: councilVoteThreshold,
        councilVetoVoteThreshold: councilVetoVoteThreshold,
        communityVetoVoteThreshold: councilVetoVoteThreshold,
        votingCoolOffTime: 0,
        depositExemptProposalCount: 0,
    });

    const governancePk = await withCreateMintGovernance(
        instructions,
        programId, // governance program id
        programVersion,
        realmPk, // realm
        mintPk, // governance token
        config, // GovernanceConfig
        false, // transferMintAuthorities
        ownerPk, // mintAuthority
        tokenOwnerRecordPk, // tokenOwnerRecord
        ownerPk, // payer
        ownerPk, // governanceAuthority
        undefined
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);

    // Set realm authority to the created governance
    // withSetRealmAuthority(
    //     instructions,
    //     programId, // governance program id
    //     programVersion,
    //     realmPk, // realm
    //     ownerPk, // realm authority
    //     governancePk, // new realm authority
    //     SetRealmAuthorityAction.SetChecked
    // );
    // console.log('SET AUTHORITY');
};
