import { Router } from 'express';
import { contentUpload } from './Upload';
import { getAllGovernanceData, getAllProposalsData, getAllRealms, getGovernanceData, getProposalData, getRealmData } from '../Governance/Services/step0_Query';
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

export const routes = Router();

// governance step1 (optional)
routes.post('/createToken', contentUpload.none(), async(req, res) => {
    let { ownerPk } = req.body;

    return res.json({
        data: await createMint(new PublicKey(ownerPk))
    });
});

// governance step2 (optional)
routes.post('/mintToken', contentUpload.none(), async(req, res) => {
    let { ownerPk, mintPk, mintAmount } = req.body;

    return res.json({
        data: await mintToken(new PublicKey(ownerPk), new PublicKey(mintPk), mintAmount)
    });
});

// governance step3.1
routes.post('/createRealm', contentUpload.none(), async(req, res) => {
    let { realmName, ownerPk, mintPk } = req.body;

    return res.json({
        data: await createRealm(realmName, new PublicKey(ownerPk), new PublicKey(mintPk))
    });
});

// governance step3.2
routes.post('/depositGovernanceToken', contentUpload.none(), async(req, res) => {
    let { realmPk, ataPk, ownerPk, mintPk, amount } = req.body;

    return res.json({
        data: await depositGovernanceToken(new PublicKey(realmPk), new PublicKey(ataPk), new PublicKey(ownerPk), new PublicKey(mintPk), Number(amount))
    });
});

// governance step3.3
routes.post('/createGovernance', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk } = req.body;

    return res.json({
        data: await createGovernance(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk))
    });
});

// governance step4.1
routes.post('/createProposal', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk, governancePk, governanceAuthorityPk, title, description, voteOptions, proposalIndex } = req.body;

    return res.json({
        data: await createProposal(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(governanceAuthorityPk), title, description, voteOptions, proposalIndex)
    });
});

// governance step 4.2 (optional)
// routes.post('/createProposalInstruction', contentUpload.none(), async(req, res) => {

// });

// governance step 4.3
routes.post('/signOffProposal', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk, governancePk, governanceAuthorityPk, title, description, voteOptions, proposalIndex } = req.body;

    return res.json({
        data: await createProposal(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(governanceAuthorityPk), title, description, voteOptions, proposalIndex)
    });
});

// governance step 4.4 (optional)
routes.post('/cancelProposal', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, governanceAuthorityPk, proposalPk } = req.body;

    const proposal = await getProposalData(proposalPk);

    return res.json({
        data: await cancelProposal(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(governanceAuthorityPk), proposal)
    });
});

// governance step 5.1
routes.post('/castVoteForSingleChoice', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, tokenOwnerRecordPk, governancePk, proposalPk, voteYesOrNo, voteVeto } = req.body;

    return res.json({
        data: await castVote(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(proposalPk), voteYesOrNo, voteVeto)
    });
});

// governance step 5.2 (optional)
routes.post('/castVoteForMultiChoice', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, mintPk, tokenOwnerRecordPk, governancePk, proposalPk, selectedOptionIndex, voteYesOrNo, voteVeto } = req.body;

    return res.json({
        data: await castVoteForMultiChoice(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(mintPk), new PublicKey(tokenOwnerRecordPk), new PublicKey(governancePk), new PublicKey(proposalPk), selectedOptionIndex, voteYesOrNo, voteVeto)
    });
});

// governance step 6
routes.post('/finalizeVote', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, proposalPk } = req.body;

    const proposal = await getProposalData(proposalPk);

    return res.json({
        data: await finalizeVote(new PublicKey(realmPk), new PublicKey(ownerPk), proposal)
    });
});

// governance step 7
routes.post('/withdrawGovernanceToken', contentUpload.none(), async(req, res) => {
    let { realmPk, ownerPk, governingTokenDestination, governingTokenMint } = req.body;

    return res.json({
        data: await withdrawGoverningTokens(new PublicKey(realmPk), new PublicKey(ownerPk), new PublicKey(governingTokenDestination), new PublicKey(governingTokenMint))
    });
});

// governance query
routes.post('/getRealm', contentUpload.none(), async(req, res) => {
    let { realmPk } = req.body;
    return res.json(await getRealmData(new PublicKey(realmPk)));
});

routes.post('/getAllRealms', contentUpload.none(), async(req, res) => {
    return res.json(await getAllRealms());
});

routes.post('/getTokenOwnerRecord', contentUpload.none(), async(req, res) => {
    let { governancePk } = req.body;
    return res.json(await getGovernanceData(new PublicKey(governancePk)));
});

routes.post('/getGovernance', contentUpload.none(), async(req, res) => {
    let { governancePk } = req.body;
    return res.json(await getGovernanceData(new PublicKey(governancePk)));
});

routes.post('/getAllGovernances', contentUpload.none(), async(req, res) => {
    let { realmPk } = req.body;
    return res.json(await getAllGovernanceData(new PublicKey(realmPk)));
});

routes.post('/getProposal', contentUpload.none(), async(req, res) => {
    let { proposalPk } = req.body;
    return res.json(await getProposalData(new PublicKey(proposalPk)));
});

routes.post('/getAllProposals', contentUpload.none(), async(req, res) => {
    let { realmPk } = req.body;
    return res.json(await getAllProposalsData(new PublicKey(realmPk)));
});


