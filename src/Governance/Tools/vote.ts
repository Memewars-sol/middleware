import {
    PublicKey
} from '@solana/web3.js';
import { getGovernanceAccounts, VoteRecord, MemcmpFilter, TokenOwnerRecord, getProposal, getGovernance, getRealm, Proposal } from '@solana/spl-governance';
import { connection, programId } from './env';
import BN from 'bn.js';
import { formatDuration } from './units';
import dayjs from 'dayjs';

export const fetchVotingRecords = async(realmPk: PublicKey, proposalPk: PublicKey) => {
    const proposal = await getProposal(connection, proposalPk);
    const governance = await getGovernance(connection, proposal.account.governance);
    const realm = await getRealm(connection, governance.account.realm);

    const votingStartUnix = proposal.account.votingAt?.toNumber() ?? 0;
    const votingDurationRaw = governance.account.config.baseVotingTime;

    const votingStartAtRaw = dayjs.unix(votingStartUnix);
    const votingStartAt = votingStartAtRaw.format('YYYY-MM-DD HH:mm:ss');
    const votingDuration = formatDuration(votingDurationRaw);
    // console.log(`votingAt: ${votingAt}`);
    // console.log(`votingDuration: ${votingDuration}`);

    const votingEndAtRaw = votingStartAtRaw.add(votingDurationRaw, 'seconds');
    const votingEndUnix = votingEndAtRaw.unix();
    const now = dayjs();
    const votingEndAt = votingEndAtRaw.format('YYYY-MM-DD HH:mm:ss');
    let votingDurationLeft = 'Ended';

    if (now.isAfter(votingEndAtRaw)) {
        // console.log('Voting period has ended.');
    } else {
        const durationLeft = votingEndAtRaw.diff(now, 'seconds');
        const formattedDurationLeft = formatDuration(durationLeft);
        votingDurationLeft = formattedDurationLeft;
        // console.log(`Voting ends in: ${formattedDurationLeft}`);
    }

    const votingDurationDiff = now.diff(votingStartAtRaw, 'seconds');
    const votingTimelapsed = votingDurationDiff > votingDurationRaw ? 1 : (votingDurationDiff / votingDurationRaw);
    console.log(`votingTimelapsed: ${votingTimelapsed}`);

    // if proposal config == deposited tokens use this params
    // console.log(`realm.account.config.communityMintMaxVoteWeightSource.value: ${realm.account.config.communityMintMaxVoteWeightSource.value}`);
    const totalWeight = realm.account.config.communityMintMaxVoteWeightSource.value.toString();
    // console.log(`totalWeight: ${totalWeight}`);

    // else use token full supply
    // const tokenSupplyInfo = await connection.getTokenSupply(realm.account.communityMint);
    // const totalWeight = tokenSupplyInfo.value.amount;
    // console.log(`totalWeight: ${totalWeight.toString()}`);

    // min threshold
    const minThreshold = governance.account.config.communityVoteThreshold.value;
    // console.log(`Min Threshold: ${minThreshold}`);

    // yes vote
    const yesVotes = proposal.account.getYesVoteCount().toString();
    const yesVotesPercent = calculatePct(new BN(yesVotes), new BN(totalWeight));
    // console.log(`yesVotes: ${yesVotes.toString()}`);
    // console.log(`yesVotePct: ${yesVotesPercent}`);

    // no vote
    const noVotes = proposal.account.getNoVoteCount().toString();
    const noVotesPercent = calculatePct(new BN(noVotes), new BN(totalWeight));
    // console.log(`noVotes: ${noVotes.toString()}`);
    // console.log(`noVotePct: ${noVotesPercent}`);

    // turnout
    const turnOut = new BN(yesVotes).add(new BN(noVotes)).toString();
    const turnOutPercent = calculatePct(new BN(turnOut), new BN(totalWeight));
    // console.log(`turnOut: ${turnOut.toString()}`);
    // console.log(`turnOutPct: ${turnOutPercent}`);

    // optional
    const vetoVotesPercent = 0;
    const abstainVotesPercent = 0;
    const vetoVotes = '0';
    const abstainVotes = '0';

    return ({
        yesVotesPercent, noVotesPercent, vetoVotesPercent, abstainVotesPercent, turnOutPercent, yesVotes, noVotes, vetoVotes, abstainVotes, totalWeight, turnOut, minThreshold, votingStartAt, votingEndAt, votingTimelapsed, votingDuration, votingDurationLeft, votingStartUnix, votingEndUnix
    });
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

export const calculatePct = (c = new BN(0), total?: BN) => {
    if (total?.isZero()) {
      return 0
    }

    return new BN(100)
      .mul(c)
      .div(total ?? new BN(1))
      .toNumber()
}
