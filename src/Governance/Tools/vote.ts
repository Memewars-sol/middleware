import {
    PublicKey
} from '@solana/web3.js';
import { getGovernanceAccounts, VoteRecord, MemcmpFilter, TokenOwnerRecord } from '@solana/spl-governance';
import { connection, programId } from './env';

export const fetchVotingRecords = async(realmPk: PublicKey, proposalPk: PublicKey) => {
    const proposalPubkeyBytes = Buffer.from(proposalPk.toBytes()); // Convert PublicKey to Buffer

    const filters: MemcmpFilter[] = [new MemcmpFilter(
        1,
        proposalPubkeyBytes
    )];

    const votingRecords = await getGovernanceAccounts<VoteRecord>(
        connection,
        programId, // Your governance program ID
        // Specify the type of account you are fetching, e.g., VotingRecord
        VoteRecord,
        filters
    );

    // console.log(JSON.stringify(votingRecords));


    // return votingRecords;

    let yesVotes = 0;
    let noVotes = 0;
    let vetoVotes = 0;
    let relinquishedVotes = 0;

    for (const { account } of votingRecords) {
        const { vote, voterWeight, isRelinquished } = account;

        // Convert voterWeight to a number, assuming it's a BN (big number)
        const weight = voterWeight ? voterWeight.toNumber() : 0;

        if (isRelinquished) {
            relinquishedVotes += weight;
        } else if (vote?.deny) {
            noVotes += weight;
        } else if (vote?.veto) {
            vetoVotes += weight;
        } else if (vote?.approveChoices) {
            // This assumes approveChoices is an array and a vote is considered 'yes' if any choice is approved
            const approved = vote?.approveChoices.some(choice => choice); // Check if any choice is approved
            if (approved) {
                yesVotes += weight;
            }
        }
    }

    console.log({ yesVotes, noVotes, vetoVotes, relinquishedVotes, totalWeight: await getTotalWeight(realmPk) });
}

export const getTotalWeight = async (realmPk: PublicKey) => {
    // Using memcmp to filter by the realm public key
    // The offset needs to be set to the position of the realm public key in the TokenOwnerRecord data structure

    const realmPubkeyBytes = Buffer.from(realmPk.toBytes()); // Convert PublicKey to Buffer

    const filters: MemcmpFilter[] = [new MemcmpFilter(
        1,
        realmPubkeyBytes
    )];


    const tokenOwnerRecords = await getGovernanceAccounts<TokenOwnerRecord>(
        connection,
        programId,
        TokenOwnerRecord, // This needs to be the class or type for token owner records
        filters
    );

    let totalWeight = 0;
    for (const record of tokenOwnerRecords) {
        // Ensure you are referencing the correct property for the deposit amount
        totalWeight += record.account.governingTokenDepositAmount.toNumber();
    }

    return totalWeight;
}