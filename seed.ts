import dotenv from 'dotenv';
import path from 'path';
import { seedBuildings, seedLand, seedSpells, seedUnits } from './src/Seeders';
import prompt from 'prompt-sync';
dotenv.config({ path: path.join(__dirname, '.env')});

(async() => {
    const yn = prompt({sigint: true})('Do you want to seed all tables? y/n\n');
    if(yn === 'y') {
        await seedBuildings();
        await seedSpells();
        await seedUnits();
        await seedLand();
        console.log('Seed ended, press CTRL / CMD + C');
    }
    return;
})();