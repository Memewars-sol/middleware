import { Router } from 'express';
import { contentUpload } from './Upload';
import { verifySignature } from '../../utils';
import { bulkMintAndAssignBuildingCNFTIdTo, mintAndAssignAccountCNFTIdTo, mintAndAssignBuildingCNFTIdTo } from '../CNFT';

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

routes.post('/mintBuildings', contentUpload.none(), async(req, res) => {
    let { address, building_ids } = req.body;
    console.log("here");
    if(!address || !building_ids) {
        console.log("error");
        console.log(building_ids);
        return res.status(400).send("Invalid Params");
    }

    if(typeof building_ids === 'string') {
        building_ids = JSON.parse(building_ids);
    }
    console.log({address, building_ids});
    await bulkMintAndAssignBuildingCNFTIdTo(address, building_ids);
    return res.send("1");
});