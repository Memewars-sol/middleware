import { Transaction, SystemProgram, Keypair, Connection, PublicKey, sendAndConfirmTransaction, ParsedInstruction } from "@solana/web3.js";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMintInstruction, getMinimumBalanceForRentExemptMint, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction, createTransferInstruction } from '@solana/spl-token';
import { DataV2, TokenStandard, createNft, createV1, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { irysStorage, keypairIdentity, Metaplex, UploadMetadataInput } from '@metaplex-foundation/js';
import { getAdminAccount, getDappDomain, getNonPublicKeyPlayerAccount, getPlayerPublicKey, getRPCEndpoint, getTokenAccounts, getTx, sendSOLTo, sleep } from "../../utils";
import { getKeypairMerkleMintAddress, getKeypairMintAddress, loadOrGenerateKeypair } from "../Helpers";
import fetch from 'node-fetch';
import DB from "../DB";
import { USDC_ADDRESS } from "../Constants";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, generateSigner, none, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { publicKey as convertToUmiPublicKey } from "@metaplex-foundation/umi-public-keys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { CNFTMetadata, CNFTType } from "./types";
import { mintToCollectionV1, mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { createTree } from '@metaplex-foundation/mpl-bubblegum'

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

export const createCollection = async({name, uri}: CNFTMetadata) => {
    const umi = createUmi(getRPCEndpoint());
    const tokenAccount = loadOrGenerateKeypair(name);
    const transactionId = await sendSOLTo(true, tokenAccount.publicKey.toBase58(), 0.5);
    console.log(`View SEND SOL Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
    console.log('waiting 13s');
    await sleep(13000);
    const collectionMint = generateSigner(umi);

    const tokenUmi = umi.eddsa.createKeypairFromSecretKey(tokenAccount.secretKey);
    const tokenSigner = createSignerFromKeypair(umi, tokenUmi);
    umi.use(signerIdentity(tokenSigner));
    umi.use(mplTokenMetadata());

    let res = await createNft(umi, {
        mint: collectionMint,
        name,
        uri,
        sellerFeeBasisPoints: percentAmount(5.5), // 5.5%
        isCollection: true,
    }).sendAndConfirm(umi)

    let signature = base58.deserialize(res.signature);
    console.log('waiting 15s');
    await sleep(15000);

    let tx = await getTx(signature[0]);
    let mintInstruction = (tx?.meta?.innerInstructions![0].instructions.filter((x) => (x as ParsedInstruction).parsed.type === "initializeMint2")[0]) as ParsedInstruction;
    let mintAddress = mintInstruction!.parsed.info.mint;

    console.log(`Transaction ID: `, signature);
    console.log(`View Create Collection Transaction: https://explorer.solana.com/tx/${signature[0]}?cluster=devnet`);

    return {signature, mintAddress};
}

// need to call when our merkle tree runs out of space
export const createMerkleTree = async() => {

    const umi = createUmi(getRPCEndpoint());
    // account is always the merkle tree's owner
    const tokenAccount = loadOrGenerateKeypair("account");
    const transactionId = await sendSOLTo(true, tokenAccount.publicKey.toBase58(), 0.5);
    console.log(`View SEND SOL Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
    console.log('waiting 13s');
    await sleep(13000);

    const tokenUmi = umi.eddsa.createKeypairFromSecretKey(tokenAccount.secretKey);
    const tokenSigner = createSignerFromKeypair(umi, tokenUmi);
    umi.use(signerIdentity(tokenSigner));
    umi.use(mplTokenMetadata());

    const merkleTree = generateSigner(umi)
    const builder = await createTree(umi, {
        merkleTree,
        maxDepth: 14,
        maxBufferSize: 64,
    })
    let res = await builder.sendAndConfirm(umi);
    let signature = base58.deserialize(res.signature);
    console.log('waiting 15s');
    await sleep(15000);

    let tx = await getTx(signature[0]);
    // merkle tree address
    let mintAddress = (tx?.transaction.message.instructions[0] as ParsedInstruction).parsed.info.newAccount;

    console.log(`Transaction ID: `, signature);
    console.log(`View Create Merkle Tree Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    return {signature, mintAddress};
}

// average mint time 1.7s
export const mintCNFTTo = async(destinationWallet: PublicKey, type: CNFTType, metadataId: number) => {
    console.log('minting cnft');
    const umi = createUmi(getRPCEndpoint());

    // merkle account owner is always "account"
    const merkleAccount = loadOrGenerateKeypair("account");
    const merkleUmi = umi.eddsa.createKeypairFromSecretKey(merkleAccount.secretKey);
    const merkleSigner = createSignerFromKeypair(umi, merkleUmi);

    const collectionAccount = loadOrGenerateKeypair(type);
    const collectionUmi = umi.eddsa.createKeypairFromSecretKey(collectionAccount.secretKey);
    const collectionSigner = createSignerFromKeypair(umi, collectionUmi);

    const collectionMintAddress = getKeypairMintAddress(type);
    // index = 0 at the moment
    const merkleMintAddress = getKeypairMerkleMintAddress();

    umi.use(signerIdentity(merkleSigner));
    // umi.use(signerIdentity(collectionSigner));
    umi.use(mplTokenMetadata());

    let res = await mintToCollectionV1(umi, {
        metadata: {
            uri: getDappDomain() + `/${type}/${metadataId}.json`,
            name: `Memewars ${type}`,
            symbol: `M${type.substring(0, 2).toUpperCase()}`,
            sellerFeeBasisPoints: 0,
            collection: {
                key: convertToUmiPublicKey(collectionMintAddress),
                verified: false,
            },
            uses: none(),
            creators: [],
        },
        leafOwner: convertToUmiPublicKey(destinationWallet.toBase58()),
        merkleTree: convertToUmiPublicKey(merkleMintAddress),
        collectionMint: convertToUmiPublicKey(collectionMintAddress),
        collectionAuthority: collectionSigner
    }).sendAndConfirm(umi);
    
    let signature = base58.deserialize(res.signature);

    // cant get mint address
    /* let tx = await getTx(signature[0]);
    let mintInstruction = (tx?.meta?.innerInstructions![0].instructions.filter((x) => (x as ParsedInstruction).parsed.type === "initializeMint2")[0]) as ParsedInstruction;
    let mintAddress = mintInstruction!.parsed.info.mint;
    console.log(mintAddress); */

    console.log(`Transaction ID: `, signature[0]);
    console.log(`View Transaction: https://explorer.solana.com/tx/${signature[0]}?cluster=devnet`);
    console.log(`View Token Mint: https://explorer.solana.com/address/${destinationWallet.toString()}?cluster=devnet`)
    return signature;
}

export const mintAndAssignAccountCNFTIdTo = async(address: string) => {
    let db = new DB();
    let query = `select id from accounts where address = '${address}'`;
    let ret = await db.executeQueryForSingleResult<{id: number}>(query);
    if(!ret) {
        console.log('cant find id');
        return;
    }

    // dont await cause we want it to run asynchronously
    mintCNFTTo(new PublicKey(address), "account", ret.id);
    setTimeout(() => {
        // might want to move this to a cron job that fills up missing accounts
        assignCNFTToAccount(address);
    }, 30000);
}

export const mintAndAssignBuildingCNFTIdTo = async(address: string, building_id: number) => {
    // dont await cause we want it to run asynchronously
    mintCNFTTo(new PublicKey(address), "building", building_id);
    setTimeout(() => {
        // might want to move this to a cron job that fills up missing accounts
        assignCNFTToBuilding(address, building_id);
    }, 30000);
}

export const getCollectionCNFTs = async(name: string) => {
    const collectionAccount = loadOrGenerateKeypair(name);

    const response = await fetch(getRPCEndpoint(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetsByGroup',
            params: {
                groupKey: 'collection',
                groupValue: collectionAccount.publicKey.toBase58(),
                page: 1, // Starts at 1
                limit: 1000,
            },
        }),
    });
    const { result } = await response.json();
    return result?.items ?? [];
    console.log(`Assets by Collection: ${collectionAccount.publicKey.toBase58()}`);
    // console.log(result.items);
    result.items.forEach((item: any) => {
        if(item.compression.compressed) {
            console.log(item.content.metadata);
            console.log(item.id);
        }
    });
}

// metadata path = dapp
export const getAddressCNFTs = async(address: string) => {
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
                ownerAddress: address,
                page: 1, // Starts at 1
                limit: 1000,
            },
        }),
    });
    const { result } = await response.json();
    return result?.items ?? [];
    console.log(`Assets by Owner: ${address}`);
    // console.log(result.items);
    result.items.forEach((item: any) => {
        console.log(item);
        if(item.compression.compressed) {
            console.log(item.content.metadata);
            console.log(item.id);
        }
    });
}

export const assignCNFTToAccount = async(address: string) => {
    let db = new DB();
    let addressCNFTs = await getAddressCNFTs(address);
    for(const item of addressCNFTs) {
        if((item.content.json_uri as string).startsWith(getDappDomain() + `/account`)) {
            let cnftId = item.id;
            let query = `UPDATE accounts SET mint_address = '${cnftId}' WHERE address = '${address}'`;
            db.executeQuery(query);
            console.log('account assigned');
        }
    };
}

export const assignCNFTToBuilding = async(address: string, building_id: number) => {
    let db = new DB();
    let addressCNFTs = await getAddressCNFTs(address);
    for(const item of addressCNFTs) {
        if((item.content.json_uri as string) === getDappDomain() + `/building/${building_id}.json`) {
            let cnftId = item.id;
            let query = `UPDATE buildings SET mint_address = '${cnftId}' WHERE id = ${building_id}`;
            db.executeQuery(query);
            console.log('building assigned');
        }
    };
}