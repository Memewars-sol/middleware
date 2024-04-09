import { getInsertQuery, getRandomNumber } from "../../utils";
import DB from "../DB";
import fs from 'fs';

export const seedBuildings = async() => {
    let db = new DB();
    let table = 'server_buildings';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns: string[] = [];
    let insertValues: any[][] = [];

    let isMac = __dirname.includes("/");
    let toReplace = isMac? "dist/" : "dist\\";
    let assetFolder = isMac? /Assets/ : '\\Assets\\';

    let buildingsData = fs.readFileSync(__dirname.replace(toReplace, "") + `${assetFolder}server_buildings.csv`);
    let rows = buildingsData.toString().split("\n");
    let ignoredIndex = 0;

    for(const [index, value] of rows.entries()) {
        let values = value.split(",");
        let insertValue = [];
        for(const [innerIndex, innerValue] of values.entries()) {
            // first row
            if(index === 0) {
                if(innerValue === 'id') {
                    // ignore id
                    ignoredIndex = innerIndex;
                    continue;
                }

                // header
                columns.push(innerValue);
                continue;
            }

            if(innerIndex === ignoredIndex) {
                continue;
            }

            insertValue.push(innerValue);
        }
        if(insertValue.length > 0) {
            insertValues.push(insertValue);
        }
    }

    let query = getInsertQuery(columns, insertValues, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedUnits = async() => {
    let db = new DB();
    let table = 'server_units';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns: string[] = [];
    let insertValues: any[][] = [];

    let isMac = __dirname.includes("/");
    let toReplace = isMac? "dist/" : "dist\\";
    let assetFolder = isMac? /Assets/ : '\\Assets\\';

    let buildingsData = fs.readFileSync(__dirname.replace(toReplace, "") + `${assetFolder}server_units.csv`);
    let rows = buildingsData.toString().split("\n");
    let ignoredIndex = 0;

    for(const [index, value] of rows.entries()) {
        let values = value.split(",");
        let insertValue = [];
        for(const [innerIndex, innerValue] of values.entries()) {
            // first row
            if(index === 0) {
                if(innerValue === 'id') {
                    // ignore id
                    ignoredIndex = innerIndex;
                    continue;
                }

                // header
                columns.push(innerValue);
                continue;
            }

            if(innerIndex === ignoredIndex) {
                continue;
            }

            insertValue.push(innerValue);
        }
        if(insertValue.length > 0) {
            insertValues.push(insertValue);
        }
    }

    let query = getInsertQuery(columns, insertValues, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedSpells = async() => {
    let db = new DB();
    let table = 'server_spells';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns: string[] = [];
    let insertValues: any[][] = [];

    let isMac = __dirname.includes("/");
    let toReplace = isMac? "dist/" : "dist\\";
    let assetFolder = isMac? /Assets/ : '\\Assets\\';

    let buildingsData = fs.readFileSync(__dirname.replace(toReplace, "") + `${assetFolder}server_spells.csv`);
    let rows = buildingsData.toString().split("\n");
    let ignoredIndex = 0;

    for(const [index, value] of rows.entries()) {
        let values = value.split(",");
        let insertValue = [];
        for(const [innerIndex, innerValue] of values.entries()) {
            // first row
            if(index === 0) {
                if(innerValue === 'id') {
                    // ignore id
                    ignoredIndex = innerIndex;
                    continue;
                }

                // header
                columns.push(innerValue);
                continue;
            }

            if(innerIndex === ignoredIndex) {
                continue;
            }

            insertValue.push(innerValue);
        }
        if(insertValue.length > 0) {
            insertValues.push(insertValue);
        }
    }

    let query = getInsertQuery(columns, insertValues, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedLand = async() => {
    let db = new DB();
    let table = 'lands';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns: string[] = ['x', 'y', 'level', 'citizen_cap', 'gems_per_block'];
    let insertValues: any[][] = [];

    // 10k tiles
    let mapSizeX = 100;
    let mapSizeY = 100;

    for(let x = 0; x < mapSizeX; x++) {
        for(let y = 0; y < mapSizeY; y++) {
            insertValues.push([
                x,
                y,
                getRandomNumber(1, 10, true),
                getRandomNumber(1, 10, true),
                getRandomNumber(1e-6, 1e-5, false, 8),
            ]);

            if(insertValues.length === 1000) {
                let query = getInsertQuery(columns, insertValues, table);
                insertValues = [];
                try {
                    await db.executeQuery(query);
                }

                catch (e){
                    console.log(e);
                }
            }
        }
    }

    if(insertValues.length == 0) {
        console.log(`Seeded ${table}`);
        return true;
    }

    let query = getInsertQuery(columns, insertValues, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }

}

export const seedGuilds = async() => {
    // might not need
    let db = new DB();
    let table = 'guilds';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns: string[] = ['mint_address', 'logo', 'name', 'realm_address', 'realm_authority_address', 'governance_address', 'governance_authority_address', 'status', 'token_owner_record'];

    let guilds = [
        // ["7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", "https://popcatsol.com/img/logo.png", "POPCAT"],
        // ["FYa25XnBsXQXAdTnsyKBKd5gZ1VZhChBRF57CqfRxJZX", "https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafybeifx7lchopsihh6qhw5nvq4tjbwl4wf2wy745mugvhdq5krk2bwsmi.ipfs.nftstorage.link", "monkeyhaircut"],
        // ["7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", "https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafkreih44n5jgqpwuvimsxzroyebjunnm47jttqusb4ivagw3vsidil43y.ipfs.nftstorage.link", "slerf"],
        ["3ZupsH7D1JhVDzQ5o6u3YQvhA3aSzPUqnMfuY7Ho17Ws", "https://cdn.europosters.eu/image/750/canvas-print-paw-patrol-tracker-i112110.jpg", "SupePawPatrol", "9DepxLYVnKrsGXsFLPKee2kfGZxKbwJxnDM4A4ubc9NM", "AndySjsCdmQbQE1GLhN35635ZEWDwVkzBC82q4e1Af4p", "9bLJixTbvvGkQXksmn2iPwQA1QNnzocEKMJVNBEPC5hY", "AndySjsCdmQbQE1GLhN35635ZEWDwVkzBC82q4e1Af4p", "active", "Cp5FcriPTiex67gE4hh4mzLA8bFJU1aBn4bxqdJbGhEL"],

        ["7CSWGs1kaDvzRMqtXHbj9oQJAGeywHvFTqQkmZufYQL3", "https://s3.ap-southeast-1.amazonaws.com/asset.cfproxypass.xyz/wif.jpg", "WIF", "AUh9xuJPcteDJEsVVPxtojfy8M8wXdY3DBz9LaHWFxSh", "AndySjsCdmQbQE1GLhN35635ZEWDwVkzBC82q4e1Af4p", "3zFDkz1N5Qi3BxP4fR3cMKVYSYK2wmivmf9LVAntc23X", "AndySjsCdmQbQE1GLhN35635ZEWDwVkzBC82q4e1Af4p", "active", "Aq674TYnyrHGHfVi5TEFVWVCCJ5W2WJwv7dosHYcVehA"],

        ["Bq1K8NiZxZXwiJyRNDTE3EWmh7SHBULirzszoK6euDzc", "https://s3.ap-southeast-1.amazonaws.com/asset.cfproxypass.xyz/popcat.png", "POP", "A34pmejByke3CSDmfYa3sgYvq3ZphEHf8CJWQuXNhtDD", "AndySjsCdmQbQE1GLhN35635ZEWDwVkzBC82q4e1Af4p", "7UzbYPNjQjhyWH4YYBZ7BxkZkMTH8BEMBRRHyS9WMS8F", "AndySjsCdmQbQE1GLhN35635ZEWDwVkzBC82q4e1Af4p", "active", "EeCu6KwGh7Fy8rLJVBHECtC7GJHyQCy4v7Pic3KWUXik"],
    ];

    let query = getInsertQuery(columns, guilds, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }

}