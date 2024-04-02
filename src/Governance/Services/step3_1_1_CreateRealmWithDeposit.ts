import { GovernanceConfig, MintMaxVoteWeightSource, VoteThreshold, VoteThresholdType, VoteTipping, getGovernanceProgramVersion, withCreateMintGovernance, withCreateRealm, withDepositGoverningTokens } from "@solana/spl-governance";
import {
    TransactionInstruction, Keypair, PublicKey
} from '@solana/web3.js';
import { connection, programId } from "../Tools/env";
import { RealmData } from "../types";
import fs from 'fs-extra';
import appRootPath from "app-root-path";
import BN from "bn.js";
import { sendTransaction } from "../Tools/sdk";
import { getSerializedTransactionInstructions } from "../Tools/serialize";
import { getTimestampFromDays } from "../Tools/units";

export const createRealmWithDeposit = async (realmName: string, ataPk: PublicKey, mintPk: PublicKey, ownerPk: PublicKey, amount: number, minCommunityTokensToCreateProposal: number = 1000, baseVotingTime: number = 1) => {
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    // Create Realm
    const realmAuthorityPk = ownerPk;

    const realmPk = await withCreateRealm(
        instructions,
        programId,
        programVersion,
        realmName,
        realmAuthorityPk, // owner
        mintPk, // token
        ownerPk, // payer
        undefined, // council
        MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION,
        new BN(1), // minCommunityWeightToCreateGovernance
        undefined
    );

    // Deposit governance tokens
    const tokenOwnerRecordPk = await withDepositGoverningTokens(
        instructions,
        programId,
        programVersion,
        realmPk,
        ataPk, // source
        mintPk, // token
        ownerPk, // token owner
        ownerPk, // token source authority
        ownerPk, // payer
        new BN(amount)
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


    let communityVetoVoteThreshold = new VoteThreshold({
        type: VoteThresholdType.YesVotePercentage,
        // For VERSION < 3 we have to pass 0
        value: programVersion >= 3 ? 10 : 0,
    });

    const config = new GovernanceConfig({
        communityVoteThreshold: communityVoteThreshold,
        minCommunityTokensToCreateProposal: new BN(minCommunityTokensToCreateProposal),
        minInstructionHoldUpTime: 0,
        baseVotingTime: getTimestampFromDays(baseVotingTime),
        communityVoteTipping: VoteTipping.Early,
        councilVoteTipping: VoteTipping.Early,
        minCouncilTokensToCreateProposal: new BN(1),
        councilVoteThreshold: councilVoteThreshold,
        councilVetoVoteThreshold: councilVetoVoteThreshold,
        communityVetoVoteThreshold: communityVetoVoteThreshold,
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

    return {
        data: serializedTransaction,
        details: {
            governancePk: governancePk.toBase58(),
            tokenOwnerRecordPk: tokenOwnerRecordPk.toBase58(),
            realmPk: realmPk.toBase58(),
            realmAuthorityPk: realmAuthorityPk.toBase58(),
            ataPk: ataPk.toBase58(),
            mintPk: mintPk.toBase58(),
        }
    };
    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
};
