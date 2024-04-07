export interface RealmData {
    programId?: string;
    programVersion?: number;
    mintPk?: string;
    ataPk?: string;
    realmAuthorityPk?: string;
    realmPk?: string;
    tokenOwnerRecordPk?: string;
    governancePk?: string;
    proposalPk?: string;
    governanceAuthorityPk?: string;
}

export interface RpcTokenBalance {
    jsonrpc: string;
    result: {
        context: {
            apiVersion: string;
            slot: number;
        };
        value: {
            account: {
                data: {
                    parsed: {
                        info: {
                            isNative: boolean;
                            mint: string;
                            owner: string;
                            state: string;
                            tokenAmount: {
                                amount: string;
                                decimals: number;
                                uiAmount: number;
                                uiAmountString: string;
                            },
                            type: string;
                        }
                        program: string;
                        space: number;
                    }
                    executable: boolean;
                    lamports: number;
                    owner: string;
                    rentEpoch: number;
                    space: number;
                }
                pubkey: string;
            }
        }[];
    };
    id: number;
}

export interface GovernanceInstructions {
    data: string;
    details: string | number [];
}