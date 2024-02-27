import { Router } from 'express';
import { contentUpload } from './Upload';
import DB from '../DB';

export const routes = Router();

// need to change to metaplex json
routes.get('/:type/:id', contentUpload.none(), async(req, res) => {
    let { type, id } = req.params;
    id = id.replace(".json", "");
    type = type + "s";
    let db = new DB();
    let query = `select * from ${type} where id = ${id}`;
    let result = await db.executeQueryForSingleResult(query);

    if(!result) {
        return res.status(404).send("Not found");
    }

    // cant serialize bigint
    for(const [key, value] of Object.entries(result)) {
        if(typeof value !== 'bigint') {
            continue;
        }

        result[key] = result[key].toString();
    }

    return res.send(result);
});