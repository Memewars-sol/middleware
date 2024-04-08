import { LAMPORTS_PER_SOL, Keypair, PublicKey, TransactionInstruction, Transaction, BlockheightBasedTransactionConfirmationStrategy } from '@solana/web3.js';
import { getAccount, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { connection } from '../Tools/env';
import * as bs58 from 'bs58';
import { getOrCreateAssociatedAccount, getTokenAuthoritySecret, sendTokensTo, sleep } from '../../../utils';
import { attempt } from 'lodash';

export const airdropGuildToken = async(mintPk: PublicKey, ownerPk: PublicKey) => {
    let attempts = 3;
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
            console.log(e);
            continue;
        }

        // set airdrop amount
        const airdropAmount = 1000 * (10 ** 9);

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
            console.log(e);
            continue;
        }

        try {
            const tx = await sendTokensTo(ownerPk.toBase58(), mintPk.toBase58(), 1, airdropAmount, mintAuthority);

            console.log(`Airdropped ${airdropAmount} tokens to ${ownerPk.toBase58()}`);
            console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
            status = 1;
            break;
        } catch(e) {
            status = 0;
            console.log(e);
            continue;
        }
    } while(attempts > 0 && status == 0);

    return status;
}
