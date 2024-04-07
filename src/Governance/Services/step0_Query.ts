import {
    PublicKey,
} from '@solana/web3.js';
import { connection, programId } from '../Tools/env';
import { ProgramAccount, TokenOwnerRecord, getAllGovernances, getAllProposals, getGovernance, getProposal, getRealm, getRealms, getTokenOwnerRecordsByOwner } from '@solana/spl-governance';
import _ from 'lodash';

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

export const getTokenRecordForRealm = async(walletPk: PublicKey, realmPk: PublicKey) => {
    const data = await getTokenOwnerRecordsByOwner(
        connection,
        programId,
        walletPk,
    );

    const account = _.find(data, (item) => {
        console.log(item);
        if (item.account.realm.toBase58() == realmPk.toBase58()) {
            return item;
        }
    });

    return account;
}

export const getTokenAmountForRealm = async(walletPk: PublicKey, realmPk: PublicKey) => {
    const data = await getTokenOwnerRecordsByOwner(
        connection,
        programId,
        walletPk,
    );

    const account = _.find(data, (item) => {
        if (item.account && item.account.realm.toBase58() == realmPk.toBase58()) {
            return item;
        }
    });

    return account ? (account as ProgramAccount<TokenOwnerRecord>).account.governingTokenDepositAmount.toNumber() : 0;
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