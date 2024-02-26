import { Router } from 'express';
import { contentUpload } from './Upload';
import { verifySignature } from '../../utils';
import { mintAndAssignCNFTIdTo } from '../CNFT';

export const routes = Router();

routes.post('/', contentUpload.none(), async(req, res) => {
    return res.send("Verified");
});

routes.post('/mintAccount', contentUpload.none(), async(req, res) => {
    let { address } = req.body;
    if(!address) {
        return res.status(400).send("Invalid Params");
    }
    console.log({address});
    await mintAndAssignCNFTIdTo(address, "account");
    return res.send("1");
});

routes.post('/mintBuilding', contentUpload.none(), async(req, res) => {
    let { address } = req.body;
    if(!address) {
        return res.status(400).send("Invalid Params");
    }
    console.log({address});
    await mintAndAssignCNFTIdTo(address, "building");
    return res.send("1");
});