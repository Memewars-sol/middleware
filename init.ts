import { PublicKey } from "@metaplex-foundation/js";
// import { initializeTree } from "./src/NFT/Initializer";
import { initializeToken, mintTo } from "./src/Token";
import { clawbackSOLFrom, getRPCEndpoint, getTx, sleep } from "./utils";
import { getKeypairMintAddress, loadOrGenerateKeypair, setKeypairMintAddress } from "./src/Helpers";
import { createCollection, createMerkleTree, getAddressCNFTs, getCollectionCNFTs, mintCNFTTo } from "./src/CNFT";
import { ParsedInstruction } from "@solana/web3.js";

// for testing purposes only
(async() => {
    // let name = "testv3";
    // let {mintAddress} = await initializeToken({
    //     name,
    //     symbol: "TESTV3",
    //     uri: "https://google.com",
    //     decimals: 8,
    // });
    // setKeypairMintAddress(name, mintAddress);
    // await mintTo(new PublicKey("EAV68HCw33Aj1b1t4Kr6fiWmBaybaTX8U6hSHsp2aTXa"), name, 1);

    // let clawbackKeypair = loadOrGenerateKeypair(name);
    // await clawbackSOLFrom(clawbackKeypair);

    // cNFT
    let cNFTname = "testv6col";
    let cNFTMerkleName = cNFTname + "_merkle";
    let {mintAddress: collectionMintAddress} = await createCollection({ name: cNFTname, uri: "https://testv5.com "});
    setKeypairMintAddress(cNFTname, collectionMintAddress);
    let {mintAddress: merkleMintAddress} = await createMerkleTree(cNFTname);
    setKeypairMintAddress(cNFTMerkleName, merkleMintAddress);
    await mintCNFTTo(new PublicKey("EAV68HCw33Aj1b1t4Kr6fiWmBaybaTX8U6hSHsp2aTXa"), cNFTname);
    await sleep(30000);
    await getCollectionCNFTs(cNFTname);
    await getAddressCNFTs("EAV68HCw33Aj1b1t4Kr6fiWmBaybaTX8U6hSHsp2aTXa");

    let clawbackKeypair = loadOrGenerateKeypair(cNFTname);
    await clawbackSOLFrom(clawbackKeypair);
    clawbackKeypair = loadOrGenerateKeypair(cNFTMerkleName);
    await clawbackSOLFrom(clawbackKeypair);
})();