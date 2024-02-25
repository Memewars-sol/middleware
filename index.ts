import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import cors from 'cors';import _ from 'lodash';
import path from 'path';
import dotenv from 'dotenv';
import { routes as apiRoutes } from './src/Routes/api';
import { getServerPort, verifySignature } from './utils';
import { VERIFY_MESSAGE } from './src/Constants';
import { contentUpload } from './src/Routes/Upload';

dotenv.config({ path: path.join(__dirname, '.env')});

process.on('uncaughtException', function (err) {
    //dont stop on uncaught exception
    console.log('Caught exception: ', err);
});

//create app
const port = getServerPort();
const whitelists = JSON.parse(process.env.CORS_WHITELIST!);

let app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({
    origin: "*",
    credentials: true
}));

/* app.use((req, res, next) => {
    // we need to check the multipart in their respective paths
    if(req.is('multipart/form-data')) {
        console.log('is multipart');
        next();
        return;
    }

    const { address, signature, message } = req.body;
    if(!signature || !address) {
        console.log('invalid params');
        return res.status(400).send('Invalid params');
    }

    let verified = verifySignature(address, signature, message ?? VERIFY_MESSAGE);
    if(!verified) {
        return res.status(401).send("Unauthorized");
    }

    next();
}); */

app.use('/api', apiRoutes);

//connect app to websocket
let http = createServer(app);

let io = new Server(http, {
    cors: {
        origin: "*",
        credentials: true
    }
});

//websocket functions
/* io.on('connection', (socket: Socket) => {
    
}); */

instrument(io, {
    auth: false
    // {
    //   type: "basic",
    //   username: "admin",
    //   password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS" // "changeit" encrypted with bcrypt
    // },
});

//websocket functions
/* io.on('connection', (socket: Socket) => {
    
}); */

//api endpoints
app.get('/', function(req, res) {
    res.send('Hello World');
});

// start the server
http.listen(port, () => {
    console.log(`I'm alive! Port: ${port}`);
});


// init cron jobs
// cron.init();