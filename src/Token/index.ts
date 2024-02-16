import { Transaction, SystemProgram, Keypair, Connection, PublicKey, sendAndConfirmTransaction, ParsedInstruction } from "@solana/web3.js";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMintInstruction, getMinimumBalanceForRentExemptMint, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction, createTransferInstruction } from '@solana/spl-token';
import { DataV2, TokenStandard, createV1, mintV1, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { irysStorage, keypairIdentity, Metaplex, UploadMetadataInput } from '@metaplex-foundation/js';
import { getAdminAccount, getDappDomain, getNonPublicKeyPlayerAccount, getPlayerPublicKey, getRPCEndpoint, getTokenAccounts, getTx, sendSOLTo, sleep } from "../../utils";
import { getKeypairMintAddress, loadOrGenerateKeypair } from "../Helpers";
import fetch from 'node-fetch';
import DB from "../DB";
import { USDC_ADDRESS } from "../Constants";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { publicKey as convertToUmiPublicKey } from "@metaplex-foundation/umi-public-keys";
import { TokenMetadata } from "./types";
import { base58 } from "@metaplex-foundation/umi/serializers";

const endpoint = getRPCEndpoint(); //Replace with your RPC Endpoint
const connection = new Connection(endpoint);

const account = getAdminAccount();
const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(account));

/**
 * 
 * @param wallet Solana Keypair
 * @param tokenMetadata Metaplex Fungible Token Standard object 
 * @returns Arweave url for our metadata json file
 */
const uploadMetadata = async (tokenMetadata: UploadMetadataInput): Promise<string> => {
    //Upload to Arweave
    const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata);
    console.log(`Arweave URL: `, uri);
    return uri;
}

export const initializeToken = async({name, symbol, uri, decimals}: TokenMetadata) => {
    const umi = createUmi(getRPCEndpoint());
    const tokenAccount = loadOrGenerateKeypair(name);
    const transactionId = await sendSOLTo(true, tokenAccount.publicKey.toBase58(), 0.5);
    console.log(`View SEND SOL Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
    console.log('waiting 13s');
    await sleep(13000);
    const mint = generateSigner(umi);

    const tokenUmi = umi.eddsa.createKeypairFromSecretKey(tokenAccount.secretKey);
    const tokenSigner = createSignerFromKeypair(umi, tokenUmi);
    umi.use(signerIdentity(tokenSigner));
    umi.use(mplTokenMetadata());

    let res = await createV1(umi, {
                        mint,
                        authority: umi.identity,
                        name,
                        symbol,
                        uri,
                        sellerFeeBasisPoints: percentAmount(0),
                        decimals,
                        isMutable: true,
                        tokenStandard: TokenStandard.Fungible,
                    })
                    .sendAndConfirm(umi);
    let signature = base58.deserialize(res.signature);
    await sleep(15000);

    let tx = await getTx(signature[0]);
    let mintInstruction = (tx?.meta?.innerInstructions![0].instructions.filter((x) => (x as ParsedInstruction).parsed.type === "initializeMint2")[0]) as ParsedInstruction;
    let mintAddress = mintInstruction!.parsed.info.mint;

    console.log(`Transaction ID: `, signature);
    console.log(`View Create Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    return {signature, mintAddress};
}

export const mintTo = async(destinationWallet: PublicKey, name: string, amount: number) => {
    const umi = createUmi(getRPCEndpoint());
    const tokenAccount = loadOrGenerateKeypair(name);
    const mintAddress = getKeypairMintAddress(name);
    
    const transactionId = await sendSOLTo(true, tokenAccount.publicKey.toBase58(), 0.03);
    console.log(`View SEND SOL (mint) Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
    console.log('sleep 13s');
    await sleep(13000);
    const mint = generateSigner(umi);

    const tokenUmi = umi.eddsa.createKeypairFromSecretKey(tokenAccount.secretKey);
    const tokenSigner = createSignerFromKeypair(umi, tokenUmi);
    umi.use(signerIdentity(tokenSigner));
    umi.use(mplTokenMetadata());

    console.log(umi.identity.publicKey);

    const res = await mintV1(umi, {
        mint: convertToUmiPublicKey(mintAddress),
        authority: umi.identity,
        amount: 1,
        tokenOwner: convertToUmiPublicKey(destinationWallet.toBase58()),
        tokenStandard: TokenStandard.Fungible,
      }).sendAndConfirm(umi);
      let signature = base58.deserialize(res.signature);
      await sleep(15000);
      let transaction = await umi.rpc.getTransaction(res.signature);
      console.log(`Completed Mint: ${amount} ` + name);
      console.log(`Transaction ID: `, signature[0]);
      console.log(`View Transaction: https://explorer.solana.com/tx/${signature[0]}?cluster=devnet`);
      console.log(`View Token Mint: https://explorer.solana.com/address/${destinationWallet.toString()}?cluster=devnet`)
      return signature;
}

export const getAddressAssets = async(userAccount: string) => {
    let errors = 0;
    let json: any  = null;
    while(errors < 10) {
        try {
            const response = await fetch(getRPCEndpoint(), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 'my-id',
                  method: 'getAssetsByOwner',
                  params: {
                    ownerAddress: userAccount,
                    page: 1, // Starts at 1
                    limit: 1000,
                    displayOptions: {
                        showFungible: true,
                    },
                  },
                }),
            });
            json = await response.json();
            return json.result.items;
        }

        catch(e: any) {
            let db = new DB();
            await db.log('Token', 'getAddressAssets', e.toString());
            errors++;
        }
    }
    return [];
}

export const getUserTokens = async(userAccount: PublicKey) => {
    let mintObject: {[mintAddress: string]: number} = {};
    let userAccounts = await getTokenAccounts(connection, userAccount.toString());
    for(let account of userAccounts) {
      let anyAccount = account.account as any;
      let mint: string = anyAccount.data["parsed"]["info"]["mint"];
      let accountAmount: number = anyAccount.data["parsed"]["info"]["tokenAmount"]["uiAmount"];

      mintObject[mint] = accountAmount;
    }

    return mintObject;
}

/* 
// account = non public key account
export const transferTo = async(account: string, destinationWallet: PublicKey, name: string, decimals: number, amount: number) => {
    const playerKeypair = getNonPublicKeyPlayerAccount(account);
    const transferToInstruction:Transaction = await createNewTransferToInstruction(playerKeypair, destinationWallet, name, decimals, amount);

    let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
    transferToInstruction.recentBlockhash = blockhash;
    transferToInstruction.lastValidBlockHeight = lastValidBlockHeight;
    transferToInstruction.feePayer = playerKeypair.publicKey;
    const transactionId = await sendAndConfirmTransaction(connection,transferToInstruction,[playerKeypair]); 
    // console.log(`Completed Transfer: ${amount} ` + whichToken);
    // console.log(`Transaction ID: `, transactionId);
    // console.log(`View Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
    // console.log(`View Transfer: https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`)
}
 */
// account = non public key account
// for migrations purposes
/* export const transferAllTo = async(account: string, destinationWallet: PublicKey) => {
    let playerPublicKey =  getPlayerPublicKey(false, account);
    let tokens = await getUserTokens(playerPublicKey);

    let goldMintAddress = getTokenPublicKey("gold");
    let expMintAddress = getTokenPublicKey("exp");

    if(tokens[goldMintAddress]) {
        await transferTo(account, destinationWallet, "gold", tokens[goldMintAddress]);
    }
    if(tokens[expMintAddress]) {
        await transferTo(account, destinationWallet, "exp", tokens[expMintAddress]);
    }

    return true;
} */

// balance will never be under 0
export const BALANCE_ERROR_NUMBER = -1;
export const getAddressTokenBalance = async(publicKey: string, tokenAddress: string) => {
    const balances = await getAddressAssets(publicKey);
    let usdcBalanceItem = balances.filter((x: any) => x.id === tokenAddress)[0];
    return usdcBalanceItem? usdcBalanceItem.token_info.balance / Math.pow(10, usdcBalanceItem.token_info.decimals) : BALANCE_ERROR_NUMBER;
}

export const getAddressUSDCBalance = async(publicKey: string) => {
    return await getAddressTokenBalance(publicKey, USDC_ADDRESS);
}