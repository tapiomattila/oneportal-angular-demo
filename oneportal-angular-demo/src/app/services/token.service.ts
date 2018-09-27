import { Injectable } from '@angular/core';
import { TokenModel } from '../common/token-model.model';
import { TokenDBService } from './tokendb.service';
import { LoggingService } from './logging.service';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    type: string;
    private tokenList: TokenModel[] = [];
    editToken: TokenModel;
    public inputTokenList: TokenModel[] = [];

    tokenCreated = false;
    inputUsed = false;

    constructor(private _tokenDbService: TokenDBService,
                private _logger: LoggingService) { }

    storeToken(token: TokenModel) {
        this.tokenList.push(token);
        this._logger.info('Show list after push');
        this._logger.info(this.tokenList);
    }

    showTokenList() {
        this._logger.info(this.tokenList);
    }

    getTokenList() {
        return this.tokenList;
    }

    storeToInputTokenList(token: TokenModel) {
        this.inputTokenList.push(token);
        this._logger.info('Show input token list after push');
        this._logger.info(this.inputTokenList);
    }

    showInputTokenList() {
        this._logger.info(this.inputTokenList);
    }

    getInputTokenList() {
        return this.inputTokenList;
    }

    storeAllInputTokens(tokenList: TokenModel[]) {
        this.inputUsed = true;
        this.tokenCreated = false;
        this.inputTokenList = tokenList;
    }

    uniqueID() {
        return Math.random().toString(36).substr(2, 8);
    }

    findIndexByRelatedIDAndKey(tokenList, token: TokenModel) {

        let index = -1;
        let searchTerm = token.relatedId+token.key;

        for(var i = 0; i < tokenList.length; i++) {
            let relId = tokenList[i].relatedId;
            let key = tokenList[i].key;

            if(relId+key === searchTerm) {
                index = i;
            }
        }

        return index;
    }

    findIndexByID(tokenList, relatedID: string) {

        let index = -1;

        for (let i = 0; i < tokenList.length; i++) {
            const relID = tokenList[i].relatedId;
            const key = tokenList[i].key;
            if (relID + key === relatedID) {
                index = i;
            }
        }
        return index;
    }

    IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    // -------- db connection  ---------->>

    postTokenToDb(token: TokenModel) {
        return this._tokenDbService.postToken(token);
    }

    getAllTokensByRelatedId(relatedId: string) {
        return this._tokenDbService.getTokens(relatedId);
    }

    deleteToken(token: TokenModel) {
        return this._tokenDbService.deleteToken(token);
    }

}
