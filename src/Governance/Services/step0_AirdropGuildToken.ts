import { LAMPORTS_PER_SOL, Keypair, PublicKey, TransactionInstruction, Transaction, BlockheightBasedTransactionConfirmationStrategy } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, mintTo, getAccount, createMintToInstruction } from '@solana/spl-token';
import { connection } from '../Tools/env';
import * as bs58 from 'bs58';
import { getOrCreateAssociatedAccount, getTokenAuthoritySecret, sendTokensTo } from '../../../utils';

export const airdropGuildToken = async(mintPk: PublicKey, recipientPk: PublicKey) => {

    //  Create a keypair from the secret key
    const mintAuthority = Keypair.fromSecretKey(bs58.decode(getTokenAuthoritySecret()));

    // Create a new account to hold the tokens
    const { associatedTokenTo, transaction } = await getOrCreateAssociatedAccount(mintAuthority.publicKey, mintAuthority.publicKey, recipientPk);

    // Get account info
    try {
        const balanceBefore = await getAccount(connection, associatedTokenTo);

        console.log(`balanceBefore: ${balanceBefore.amount.toString()}`);
        // if already got balance
        if (Number(balanceBefore.amount.toString()) > 0) {
            return 0;
        }
    } catch(e) {}

    const tx = await sendTokensTo(recipientPk.toBase58(), mintPk.toBase58(), 1, 100, mintAuthority);

    console.log(`Airdropped 1000 tokens to ${recipientPk.toBase58()}`);
    console.log(`https://solscan.io/tx/${tx}?cluster=devnet`);
    return 1;
}
