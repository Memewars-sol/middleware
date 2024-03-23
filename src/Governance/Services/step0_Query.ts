import {
    PublicKey,
} from '@solana/web3.js';
import { connection, programId } from '../Tools/env';
import { getAllGovernances, getAllProposals, getGovernance, getProposal, getRealm, getRealms, getTokenOwnerRecordsByOwner } from '@solana/spl-governance';

export const getRealmData = async(realmPk: PublicKey) => {
    return await getRealm(connection, realmPk);
}

export const getAllRealms = async() => {
    return await getRealms(connection, programId);
}

export const getTokenOwnerData = async(walletPk: PublicKey) => {
    return await getTokenOwnerRecordsByOwner(
        connection,
        programId,
        walletPk,
    );
}

export const getGovernanceData = async(governancePk: PublicKey) => {
    return await getGovernance(connection, governancePk);
}

export const getAllGovernanceData = async(realmPk: PublicKey) => {
    return await getAllGovernances(connection, programId, realmPk);
}

export const getProposalData = async(proposalPk: PublicKey) => {
    return await getProposal(connection, proposalPk);
}

export const getAllProposalsData = async(realmPk: PublicKey) => {
    return await getAllProposals(connection, programId, realmPk);
}