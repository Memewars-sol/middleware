import {
    PublicKey,
    TransactionInstruction,
    Keypair
} from '@solana/web3.js';
import { InstructionData, getGovernanceProgramVersion, withSignOffProposal } from '@solana/spl-governance';
import { sendTransaction } from '../Tools/sdk';
import { connection, programId } from '../Tools/env';
import { getSerializedTransactionInstructions } from '../Tools/serialize';
import bs58 from 'bs58';
import { getTokenAuthoritySecret } from '../../../utils';

export const signOffProposal = async(realmPk: PublicKey, ownerPk: PublicKey, tokenOwnerRecordPk: PublicKey, governancePk: PublicKey, proposalPk: PublicKey, signatoryRecordPk: PublicKey | undefined = undefined, proposalInstructions: TransactionInstruction[] = []) => {
    const signers: Keypair[] = [];
    let instructions: TransactionInstruction[] = [];

    // merge instruction
    instructions = [...instructions, ...proposalInstructions];

    // Get governance program version
    const programVersion = await getGovernanceProgramVersion(
        connection,
        programId
    );

    //  realm / governance owner
    // const governanceAuthorityKP = Keypair.fromSecretKey(bs58.decode(getTokenAuthoritySecret()));
    // const signatoryPk = governanceAuthorityKP.publicKey;
    const signatoryPk = ownerPk;
    // signers.push(governanceAuthorityKP);

    withSignOffProposal(
        instructions,
        programId,
        programVersion,
        realmPk, // realm
        governancePk, // governance
        proposalPk, // proposal
        signatoryPk, //signer
        signatoryRecordPk, // signer record
        tokenOwnerRecordPk, // proposal owner record / token owner record
    );

    // Assuming 'transaction' is a Solana Transaction object fully prepared and possibly signed
    const serializedTransaction = await getSerializedTransactionInstructions(instructions, signers, ownerPk);

    return serializedTransaction;

    // const tx = await sendTransaction(connection, instructions, signers, owner);
    // console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
}