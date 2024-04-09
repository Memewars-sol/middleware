import {
    Connection,
    PublicKey,
} from '@solana/web3.js';
import { getRPCEndpoint } from '../../../utils';
import appRootPath from 'app-root-path';
import dotenv from 'dotenv';
dotenv.config({ path: appRootPath.resolve('.env')});

export const connection = new Connection(getRPCEndpoint());
export const programId = new PublicKey(process.env.GOVERNANCE_PROGRAM_ID!);