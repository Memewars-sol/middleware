import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export async function sendTransaction(connection: Connection, instructions: TransactionInstruction[], signers: Keypair[], feePayer: Keypair) {

    // Log the transaction details
    //   console.log(`Fee Payer: ${feePayer.publicKey.toBase58()}`);
    //   console.log(`Number of Instructions: ${instructions.length}`);
    //   instructions.forEach((instruction, index) => {
    //     console.log(`Instruction ${index}:`);
    //     console.log(`  Program ID: ${instruction.programId.toBase58()}`);
    //     instruction.keys.forEach(key => {
    //       console.log(`  Account: ${key.pubkey.toBase58()}, Signer: ${key.isSigner}, Writable: ${key.isWritable}`);
    //     });
    //     console.log(`  Data (hex): ${instruction.data.toString('hex')}`);
    // });
    // console.log(JSON.stringify(signers));


    let transaction = new Transaction({ feePayer: feePayer.publicKey })
    transaction.add(...instructions)
    signers.push(feePayer);
    let tx = await connection.sendTransaction(transaction, signers)

    await connection.confirmTransaction(tx);

    return tx;
}

export async function requestAirdrop(connection: Connection, walletPk: PublicKey) {
    const airdropSignature = await connection.requestAirdrop(
        walletPk,
        (LAMPORTS_PER_SOL * 3),
    );

    await connection.confirmTransaction(airdropSignature);
}