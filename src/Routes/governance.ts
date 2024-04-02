import { Router } from 'express';
import { contentUpload } from './Upload';
import { getAllGovernanceData, getAllProposalsData, getAllRealms, getGovernanceData, getProposalData, getRealmData, getTokenOwnerData } from '../Governance/Services/step0_Query';
import { PublicKey } from '@solana/web3.js';
import { createMint } from '../Governance/Services/step1_CreateMint';
import { mintToken } from '../Governance/Services/step2_MintToken';
import { createRealm } from '../Governance/Services/step3_1_CreateRealm';
import { depositGovernanceToken } from '../Governance/Services/step3_2_DepositGovernanceToken';
import { createGovernance } from '../Governance/Services/step3_3_CreateGovernance';
import { createProposal } from '../Governance/Services/step4_1_CreateProposal';
import { cancelProposal } from '../Governance/Services/step4_4_CancelProposal';
import { castVote } from '../Governance/Services/step5_1_CastVote';
import { castVoteForMultiChoice } from '../Governance/Services/step5_2_CastVoteForMultiChoice';
import { finalizeVote } from '../Governance/Services/step6_FinalizeVote';
import { withdrawGoverningTokens } from '../Governance/Services/step7_WithdrawGovernanceToken';
import { createProposalInstruction } from '../Governance/Services/step4_2_CreateProposalInstructionForMint';
import { signOffProposal } from '../Governance/Services/step4_3_SignOffProposal';
import { createRealmWithDeposit } from '../Governance/Services/step3_1_1_CreateRealmWithDeposit';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
// import { Token } from '@metaplex/js';


export const routes = Router();

// governance step1 (optional)
routes.post('/createToken', contentUpload.none(), async(req, res) => {
    let { ownerPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await createMint(new PublicKey(ownerPk))
        });
    } catch(e) {
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step2 (optional)
routes.post('/mintToken', contentUpload.none(), async(req, res) => {
    let { ownerPk, mintPk, mintAmount } = req.body;

    try {
        return res.json({
            status: 1 ,
            data: await mintToken(new PublicKey(ownerPk), new PublicKey(mintPk), mintAmount)
        });
    } catch(e) {
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step3.1.1
routes.post('/createRealmWithDeposit', contentUpload.none(), async(req, res) => {
    let { realmName, ownerPk, mintPk, amount } = req.body;

    const ataPk = await getAssociatedTokenAddress(
        new PublicKey(mintPk),
        new PublicKey(ownerPk),
    );

    try {
        const data = await createRealmWithDeposit(realmName, ataPk, new PublicKey(ownerPk), new PublicKey(mintPk), Number(amount));

        return res.json({
            status: 1,
            data: data.serializedTransaction,
            addresses: data?.addresses
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step3.1
routes.post('/createRealm', contentUpload.none(), async(req, res) => {
    let { realmName, ownerPk, mintPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await createRealm(realmName, new PublicKey(ownerPk), new PublicKey(mintPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step3.2
routes.post('/depositGovernanceToken', contentUpload.none(), async(req, res) => {
    let { realmPk, ataPk, ownerPk, mintPk, amount } = req.body;

    try {
        return res.json({
            status: 1,
            data: await depositGovernanceToken(new PublicKey(realmPk), new PublicKey(ataPk), new PublicKey(ownerPk), new PublicKey(mintPk), Number(amount))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step3.3
routes.post('/createGovernance', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await createGovernance(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step4.1
routes.post('/createProposal', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk, governancePk, governanceAuthorityPk, title, description, voteOptions, proposalIndex } = req.body;

    try {
        return res.json({
            status: 1,
            data: await createProposal(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(governanceAuthorityPk), title, description, voteOptions, proposalIndex)
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 4.2 (optional) - the return data is unserialized at the moment
routes.post('/createProposalInstruction', contentUpload.none(), async(req, res) => {
    let { ownerPk, mintPk, tokenOwnerRecordPk, governancePk, governanceAuthorityPk, ataPk, proposalPk, mintAuthorityPk, mintAmount } = req.body;

    try {
        return res.json({
            status: 1,
            data: await createProposalInstruction(new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(governanceAuthorityPk), new PublicKey(ataPk), new PublicKey(proposalPk), new PublicKey(mintAuthorityPk), mintAmount)
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 4.3
routes.post('/signOffProposal', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, tokenOwnerRecordPk, governancePk, proposalPk, signatoryPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await signOffProposal(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(proposalPk), new PublicKey(signatoryPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 4.4 (optional)
routes.post('/cancelProposal', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, governanceAuthorityPk, proposalPk } = req.body;


    try {
        const proposal = await getProposalData(proposalPk);
        console.log(proposal);

        return res.json({
            status: 1,
            data: await cancelProposal(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(governanceAuthorityPk), proposal)
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 5.1
routes.post('/castVoteForSingleChoice', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, tokenOwnerRecordPk, governancePk, proposalPk, voteYesOrNo, voteVeto } = req.body;

    try {
        return res.json({
            status: 1,
            data: await castVote(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(proposalPk), voteYesOrNo, voteVeto)
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 5.2 (optional)
routes.post('/castVoteForMultiChoice', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk, governancePk, proposalPk, selectedOptionIndex, voteYesOrNo, voteVeto } = req.body;

    try {
        return res.json({
            status: 1,
            data: await castVoteForMultiChoice(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(proposalPk), selectedOptionIndex, voteYesOrNo, voteVeto)
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 6
routes.post('/finalizeVote', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, proposalPk } = req.body;

    try {
        const proposal = await getProposalData(proposalPk);

        return res.json({
            status: 1,
            data: await finalizeVote(new PublicKey(realmPk), new PublicKey(ownerPk), proposal)
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance step 7
routes.post('/withdrawGovernanceToken', contentUpload.none(), async(req, res) => {
    // governingTokenDestination = ataPk
    // governingTokenMint = mintPk
    let { realmPk, ownerPk, governingTokenDestination, governingTokenMint } = req.body;

    try {
        return res.json({
            status: 1,
            data: await withdrawGoverningTokens(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(governingTokenDestination), new PublicKey(governingTokenMint))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

// governance query
routes.post('/getRealm', contentUpload.none(), async(req, res) => {
    let { realmPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await getRealmData(new PublicKey(realmPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

routes.post('/getAllRealms', contentUpload.none(), async(req, res) => {
    try {
        return res.json({
            status: 1,
            data: await getAllRealms()
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

routes.post('/getTokenOwnerRecord', contentUpload.none(), async(req, res) => {
    let { walletPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await getTokenOwnerData(new PublicKey(walletPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

routes.post('/getGovernance', contentUpload.none(), async(req, res) => {
    try {
        let { governancePk } = req.body;
        return res.json({
            data: await getGovernanceData(new PublicKey(governancePk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

routes.post('/getAllGovernances', contentUpload.none(), async(req, res) => {
    let { realmPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await getAllGovernanceData(new PublicKey(realmPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

routes.post('/getProposal', contentUpload.none(), async(req, res) => {
    let { proposalPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await getProposalData(new PublicKey(proposalPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});

routes.post('/getAllProposals', contentUpload.none(), async(req, res) => {
    let { realmPk } = req.body;

    try {
        return res.json({
            status: 1,
            data: await getAllProposalsData(new PublicKey(realmPk))
        });
    } catch(e) {
        console.log(e);
        return res.json({
            status: 0,
            data: null
        })
    }
});


