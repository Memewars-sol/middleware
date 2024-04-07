import { getGovernanceProgramVersion, withDepositGoverningTokens } from "@solana/spl-governance";
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
import { getTokenAmountForRealm } from "./step0_Query";
import { getAccount } from "@solana/spl-token";

export const depositAllGovernanceToken = async(realmPk: PublicKey, ataPk: PublicKey, mintPk: PublicKey, ownerPk: PublicKey) => {
    let instructions: TransactionInstruction[] = [];
    let signers: Keypair[] = [];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    let amount = 0;

    try {
        const balanceRequest = await getAccount(connection, ataPk);
        // if already got balance
        const balance = Number(balanceRequest.amount.toString());
        amount = balance > 0 ? balance : amount;
    } catch(e) {}

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

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return {
        data: serializedTransaction,
        details: {
            tokenOwnerRecordPk: tokenOwnerRecordPk.toBase58(),
            ataPk: ataPk.toBase58()
        }
    };

    // const depositTx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${depositTx}?cluster=devnet`);
}