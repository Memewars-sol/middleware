import { getInsertQuery } from "../../utils";
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

    let buildingsData = fs.readFileSync(__dirname.replace("dist/", "") + '/Assets/server_buildings.csv');
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

    let buildingsData = fs.readFileSync(__dirname.replace("dist/", "") + '/Assets/server_units.csv');
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

    let buildingsData = fs.readFileSync(__dirname.replace("dist/", "") + '/Assets/server_spells.csv');
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