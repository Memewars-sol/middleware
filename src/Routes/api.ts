import { Router } from 'express';
import { contentUpload } from './Upload';
import { verifySignature } from '../../utils';
import { mintAndAssignAccountCNFTIdTo, mintAndAssignBuildingCNFTIdTo } from '../CNFT';

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
    await mintAndAssignAccountCNFTIdTo(address);
    return res.send("1");
});

routes.post('/mintBuilding', contentUpload.none(), async(req, res) => {
    let { address, building_id } = req.body;
    if(!address || !building_id) {
        return res.status(400).send("Invalid Params");
    }
    console.log({address, building_id});
    await mintAndAssignBuildingCNFTIdTo(address, building_id);
    return res.send("1");
});