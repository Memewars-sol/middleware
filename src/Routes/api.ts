import { Router } from 'express';
import { contentUpload } from './Upload';
import { verifySignature } from '../../utils';

export const routes = Router();

routes.post('/', contentUpload.none(), async(req, res) => {
    return res.send("Verified");
});