import { MintMaxVoteWeightSource, getGovernanceProgramVersion, withCreateRealm } from '@solana/spl-governance';
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { sendTransaction } from '../Tools/sdk';
import fs from 'fs-extra';
import appRootPath from 'app-root-path';
import { connection, programId } from '../Tools/env';
import { RealmData } from '../types';
import { getSerializedTransactionInstructions } from '../Tools/serialize';

export const createRealm = async (realmName: string, ownerPk: PublicKey, mintPk: PublicKey) => {
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

    // suitable if we run multiple realm - single governance approach
    // not suit for single realm - multi governance
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

    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
};
