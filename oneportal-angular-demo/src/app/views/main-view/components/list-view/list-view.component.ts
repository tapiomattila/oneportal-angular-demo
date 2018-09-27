import { OnInit, Component } from '@angular/core';
import { TokenService } from '../../../../services/token.service';
import { Router, ActivatedRoute } from '../../../../../../node_modules/@angular/router';
import { TokenModel } from '../../../../common/token-model.model';
import { LoggingService } from '../../../../services/logging.service';

@Component({
    selector: "app-list-view",
    templateUrl: "./list-view.component.html",
    styleUrls: ["./list-view.component.css"]
})
export class ListViewComponent implements OnInit {

    tokenList: TokenModel[];
    viewTokenList: TokenModel[];
    inputNeedsValue = false;

    constructor(public _tokenService: TokenService,
        private router: Router,
        private route: ActivatedRoute,
        private _logger: LoggingService) { }

    ngOnInit() {
        this.tokenList = this._tokenService.getTokenList();
    }

    editToken(token) {
        this._logger.info('Show token info');
        this._logger.info(token);

        this._logger.info('show token list');
        this._logger.info(this.tokenList);

        this._logger.info('Get token relatedId');
        this._logger.info(token.relatedId);
        const relID = token.relatedId;

        this._logger.info('Get token key');
        this._logger.info(token.key);
        const key = token.key;

        const id = relID + key;
        let notANumberBool = false;

        const jsonBool = this._tokenService.IsJsonString(token.value);
        if (jsonBool) {
            const testANumber = parseInt(token.value, 10);
            const notANumber = isNaN(testANumber);
            this._logger.info(jsonBool);
            this._logger.info(notANumber);

            if (notANumber) {
                notANumberBool = true;
            }
        }

        if (jsonBool) {
            this.router.navigate(['../complex', id], { relativeTo: this.route });
        }
        if (!jsonBool || (jsonBool && !notANumberBool)) {
            this.router.navigate(['../simple', id], { relativeTo: this.route });
        }
    }

    deleteToken(token) {
        this._logger.info('delete token pressed');

        this._logger.info(token);

        let tokenList;

        if (this._tokenService.tokenCreated) {
            tokenList = this._tokenService.getTokenList();
        }

        if (this._tokenService.inputUsed) {
            tokenList = this._tokenService.getInputTokenList();
        }

        this._logger.info(tokenList);

        const index = this._tokenService.findIndexByRelatedIDAndKey(tokenList, token);

        this._tokenService.deleteToken(token)
            .subscribe(res => {
                this._logger.info('selected token deleted');
                this._logger.info(res);
            });

        if (index !== -1) {
            this._logger.info('token found');
            this._logger.info(token);
            tokenList.splice(index, 1);
            this.viewTokenList = tokenList;
        }

        this._logger.info('Show list after splice');
        this._logger.info(tokenList);

        this._logger.info('Show tokenlist in service');
        this._logger.info(this._tokenService.getTokenList());
    }

    inputSearch(value: string) {
        this._logger.info('input search pressed');
        this._logger.info(value);
        if (value === '') {
            this.inputNeedsValue = true;
            setTimeout(() => {
                this.inputNeedsValue = false;
            }, 1500);
        }

        this._tokenService.getAllTokensByRelatedId(value)
            .subscribe(res => {
                this._logger.info('show res for input get');
                this._logger.info(res);
                this._tokenService.storeAllInputTokens(res);
            });
    }

}