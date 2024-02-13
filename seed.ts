import dotenv from 'dotenv';
import path from 'path';
import {} from './src/Seeders';
import prompt from 'prompt-sync';
dotenv.config({ path: path.join(__dirname, '.env')});

(async() => {
    const yn = prompt({sigint: true})('Do you want to seed all tables? y/n\n');
    if(yn === 'y') {
        console.log('Seed ended, press CTRL / CMD + C');
    }
    return;
})();