import { LAMPORTS_PER_SOL, Keypair, PublicKey, TransactionInstruction, Transaction, BlockheightBasedTransactionConfirmationStrategy } from '@solana/web3.js';
import { getAccount, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { connection } from '../Tools/env';
import * as bs58 from 'bs58';
import { getOrCreateAssociatedAccount, getTokenAuthoritySecret, sendSOLTo, sendTokensTo, sleep } from '../../../utils';
import { attempt } from 'lodash';

export const airdropGuildToken = async(mintPk: PublicKey, ownerPk: PublicKey) => {
    let attempts = 5;
    let status = 0;
    do {
        attempts--;

        //  Create a keypair from the secret key
        const mintAuthority = Keypair.fromSecretKey(bs58.decode(getTokenAuthoritySecret()));

        let associatedTokenTo = null;
        try {
            // Create a new account to hold the tokens
            associatedTokenTo = await getOrCreateAssociatedTokenAccount(connection, mintAuthority, mintPk, ownerPk);
        } catch(e) {
            status = 0;
            console.log(`getOrCreateAssociatedTokenAccount`);
            console.log(e);
            continue;
        }

        // set airdrop amount
        // const airdropAmount = 1000;
        const airdropAmount = 1_000;

        // Get account info
        try {
            const balanceBefore = await getAccount(connection, associatedTokenTo.address);
            console.log(`balanceBefore: ${balanceBefore.amount.toString()}`);
            // if already got balance
            if (Number(balanceBefore.amount.toString()) > 0) {
                status = 0;
                break;
            }
        } catch(e) {
            status = 0;
            console.log(`getAccount`);
            console.log(e);
            continue;
        }

        // 1,000,000,000
        try {
            const tx = await sendTokensTo(ownerPk.toBase58(), mintPk.toBase58(), 1, airdropAmount, mintAuthority);
            const tx2 = await sendSOLTo(true, ownerPk.toBase58(), 0.2, mintAuthority);
            console.log(`Airdropped ${airdropAmount} tokens to ${ownerPk.toBase58()}`);
            console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
            console.log(`https://solscan.io/tx/${tx2}?cluster=devnet`);
            status = 1;
            break;
        } catch(e) {
            status = 0;
            console.log(`sendTokensTo`);
            console.log(e);
            continue;
        }
    } while(attempts > 0 && status == 0);

    return status;
}
