import { Transaction, SystemProgram, Keypair, Connection, PublicKey, sendAndConfirmTransaction, ParsedInstruction } from "@solana/web3.js";
import { DataV2, TokenStandard, createNft, createV1, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { irysStorage, keypairIdentity, Metaplex, UploadMetadataInput } from '@metaplex-foundation/js';
import { getMetadataUrl, getAdminAccount, getDappDomain, getMetadataBaseUrlForType, getNonPublicKeyPlayerAccount, getPlayerPublicKey, getRPCEndpoint, getTokenAccounts, getTx, sendSOLTo, sleep } from "../../utils";
import { getKeypairMerkleMintAddress, getKeypairMintAddress, loadOrGenerateKeypair } from "../Helpers";
import fetch from 'node-fetch';
import DB from "../DB";
import { USDC_ADDRESS } from "../Constants";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Instruction, TransactionBuilder, Umi, createSignerFromKeypair, generateSigner, none, percentAmount, signerIdentity } from "@metaplex-foundation/umi";
import { publicKey as convertToUmiPublicKey, PublicKey as MetaplexPublicKey } from "@metaplex-foundation/umi-public-keys";
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
            uri: getMetadataUrl(type, metadataId),
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

    console.log(`Transaction ID: `, signature[0]);
    console.log(`View Transaction: https://explorer.solana.com/tx/${signature[0]}?cluster=devnet`);
    console.log(`View Token Mint: https://explorer.solana.com/address/${destinationWallet.toString()}?cluster=devnet`)
    return signature;
}

// average mint time 1.7s
// have to be careful to not exceed transaction size
export const bulkMintCNFTTo = async(destinationWallet: PublicKey, type: CNFTType, metadataIds: number[]) => {
    const MAX_BULK_SIZE = 1;
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

    for(const metadataId of metadataIds) {
        let res = await mintToCollectionV1(umi, {
            metadata: {
                uri: getMetadataUrl(type, metadataId),
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
        console.log(`View Transaction: https://explorer.solana.com/tx/${signature[0]}?cluster=devnet`);

        // stupid way of minting
        await sleep(100);
    }

    console.log(`View Token Mint: https://explorer.solana.com/address/${destinationWallet.toString()}?cluster=devnet`)
    return "";
}

// not working
export const sendInstructionsViaUmi = async(umi: Umi, signerPublicKey: MetaplexPublicKey, instructions: Instruction[]) => {
    let latestBlockhash = await umi.rpc.getLatestBlockhash();
    let umiTransaction = umi.transactions.create({
        version: 0,
        payer: signerPublicKey,
        instructions,
        blockhash: latestBlockhash.blockhash,
    });

    try {
        let res = await umi.rpc.sendTransaction(umiTransaction);
        let signature = base58.deserialize(res);

        // cant get mint address
        console.log(`Transaction ID: `, signature[0]);
        console.log(`View Transaction: https://explorer.solana.com/tx/${signature[0]}?cluster=devnet`);
        return signature;
    }

    catch(e) {
        console.log(e);
    }
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

export const bulkMintAndAssignBuildingCNFTIdTo = async(address: string, building_ids: number[]) => {
    // dont await cause we want it to run asynchronously
    bulkMintCNFTTo(new PublicKey(address), "building", building_ids);
    setTimeout(() => {
        // might want to move this to a cron job that fills up missing accounts
        bulkAssignCNFTToBuilding(address, building_ids);
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

    // console.log(`Assets by Collection: ${collectionAccount.publicKey.toBase58()}`);
    // result.items.forEach((item: any) => {
    //     if(item.compression.compressed) {
    //         console.log(item.content.metadata);
    //         console.log(item.id);
    //     }
    // });

    return result?.items ?? [];
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

    // console.log(`Assets by Owner: ${address}`);
    // result.items.forEach((item: any) => {
    //     console.log(item);
    //     if(item.compression.compressed) {
    //         console.log(item.content.metadata);
    //         console.log(item.id);
    //     }
    // });

    return result?.items ?? [];
}

export const assignCNFTToAccount = async(address: string) => {
    let db = new DB();
    let addressCNFTs = await getAddressCNFTs(address);
    let collectionMintAddress = getKeypairMintAddress("account");

    for(const item of addressCNFTs) {
        // not in collection
        if(item.grouping.filter((x: any) => x.group_key === "collection" && x.group_value === collectionMintAddress).length === 0) {
            continue;
        }

        if((item.content.json_uri as string).startsWith(getMetadataBaseUrlForType("account"))) {
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
    let collectionMintAddress = getKeypairMintAddress("building");

    for(const item of addressCNFTs) {
        // not in collection
        if(item.grouping.filter((x: any) => x.group_key === "collection" && x.group_value === collectionMintAddress).length === 0) {
            continue;
        }

        if((item.content.json_uri as string) === getMetadataUrl("building", building_id)) {
            let cnftId = item.id;
            let query = `UPDATE buildings SET mint_address = '${cnftId}' WHERE id = ${building_id}`;
            db.executeQuery(query);
            console.log('building assigned');
        }
    };
}

export const bulkAssignCNFTToBuilding = async(address: string, building_ids: number[]) => {
    let db = new DB();
    let addressCNFTs = await getAddressCNFTs(address);

    let startsWith = getMetadataBaseUrlForType("building");
    let collectionMintAddress = getKeypairMintAddress("building");

    for(const item of addressCNFTs) {
        let uri = (item.content.json_uri as string);
        if(!uri.startsWith(startsWith)) {
            continue;
        }

        // not in collection
        if(item.grouping.filter((x: any) => x.group_key === "collection" && x.group_value === collectionMintAddress).length === 0) {
            continue;
        }

        try {
            let building_id = parseInt(uri.replace(startsWith + "/", "").replace(".json", ""));
            if(!building_ids.includes(building_id)) {
                console.log(`building id not in ids : ${building_id}`);
                continue;
            }
            let cnftId = item.id;
            let query = `UPDATE buildings SET mint_address = '${cnftId}' WHERE id = ${building_id}`;
            db.executeQuery(query);
            console.log('building assigned');
        }

        catch(e) {
            console.log(`Error getting: ${uri}`);
            continue;
        }
    };
}