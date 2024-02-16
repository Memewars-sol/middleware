import { PublicKey } from "@metaplex-foundation/js";
// import { initializeTree } from "./src/NFT/Initializer";
import { initializeToken, mintTo } from "./src/Token";
import { clawbackSOLFrom, getRPCEndpoint, getTx } from "./utils";
import { getKeypairMintAddress, loadOrGenerateKeypair, setKeypairMintAddress } from "./src/Helpers";

// for testing purposes only
(async() => {
    let name = "testv3";
    let {mintAddress} = await initializeToken({
        name,
        symbol: "TESTV3",
        uri: "https://google.com",
        decimals: 8,
    });
    setKeypairMintAddress(name, mintAddress);
    await mintTo(new PublicKey("EAV68HCw33Aj1b1t4Kr6fiWmBaybaTX8U6hSHsp2aTXa"), name, 1);

    let clawbackKeypair = loadOrGenerateKeypair(name);
    await clawbackSOLFrom(clawbackKeypair);
})();