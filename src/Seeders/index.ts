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

    let columns: string[] = ['mint_address', 'logo', 'name'];

    let guilds = [
        ["7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", "https://popcatsol.com/img/logo.png", "POPCAT"],
        ["FYa25XnBsXQXAdTnsyKBKd5gZ1VZhChBRF57CqfRxJZX", "https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafybeifx7lchopsihh6qhw5nvq4tjbwl4wf2wy745mugvhdq5krk2bwsmi.ipfs.nftstorage.link", "monkeyhaircut"],
        ["7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", "https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafkreih44n5jgqpwuvimsxzroyebjunnm47jttqusb4ivagw3vsidil43y.ipfs.nftstorage.link", "slerf"],
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