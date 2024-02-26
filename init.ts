import { PublicKey } from "@metaplex-foundation/js";
// import { initializeTree } from "./src/NFT/Initializer";
import { initializeToken, mintTo } from "./src/Token";
import { clawbackSOLFrom, getDappDomain, getRPCEndpoint, getTx, sleep } from "./utils";
import { getKeypairMintAddress, loadOrGenerateKeypair, setKeypairMerkleMintAddress, setKeypairMintAddress } from "./src/Helpers";
import { assignAccountCNFTToAccount, createCollection, createMerkleTree, getAddressCNFTs, getCollectionCNFTs, mintAndAssignCNFTIdTo, mintCNFTTo } from "./src/CNFT";
import { ParsedInstruction } from "@solana/web3.js";
import { CNFTType } from "./src/CNFT/types";

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
    let type: CNFTType = "account";
    let {mintAddress: accountCollectionMintAddress} = await createCollection({ name: type, uri: `${getDappDomain()}/collection/${type}.json`});
    setKeypairMintAddress(type, accountCollectionMintAddress);
    type = "building";
    let {mintAddress: buidlingCollectionMintAddress} = await createCollection({ name: type, uri: `${getDappDomain()}/collection/${type}.json`});
    setKeypairMintAddress(type, buidlingCollectionMintAddress);

    // need to create one every 20k cNFTs minted
    // merkle key is only needed to mint cNFTs, once full, can just + index, but good to store in db just in case
    // can use merkle index
    let {mintAddress: merkleMintAddress} = await createMerkleTree();
    setKeypairMerkleMintAddress(type, merkleMintAddress);
    // await getCollectionCNFTs(type);

    // await mintAndAssignCNFTIdTo("5fCJG9JoexD9JKfq4JxARVByb6hKSkiuDH1HGS1HVATd", "account")

    // let clawbackKeypair = loadOrGenerateKeypair(type);
    // await clawbackSOLFrom(clawbackKeypair);
    // await getAddressCNFTs("GvevEJFHecNEZFk9jZ7j6dyk6zQNXHsFCe8EZGsvuNrE", "account");
})();