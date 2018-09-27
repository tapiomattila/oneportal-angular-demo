import { OnInit, Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { TokenService } from '../../../../services/token.service';
import { TokenModel } from '../../../../common/token-model.model';
import { ActivatedRoute } from '../../../../../../node_modules/@angular/router';
import { LoggingService } from '../../../../services/logging.service';

@Component({
    selector: "app-simple-token",
    templateUrl: "./simple-token.component.html",
    styleUrls: ["./simple-token.component.css"]
})
export class SimpleTokenComponent implements OnInit {

    simpleTokenForm: FormGroup;
    id: string;
    editMode = false;
    private editToken: TokenModel;
    private tokenList: TokenModel[];
    JSONFormat = false;

    constructor(private fb: FormBuilder,
        private _tokenService: TokenService,
        private route: ActivatedRoute,
        private _logger: LoggingService) { }

    ngOnInit() {
        this.checkURLParams();
        this.getTokenList();
        this.initForm();

        this._logger.info('Show booleans, created, input');
        this._logger.info(this._tokenService.tokenCreated);
        this._logger.info(this._tokenService.inputUsed);
        this._logger.info('Show input list');
        this._logger.info(this._tokenService.getInputTokenList());
    }

    checkURLParams() {
        this.id = this.route.snapshot.params['id'];
    }

    getTokenList() {
        this.tokenList = this._tokenService.getTokenList();
    }

    initForm() {
        this._logger.info('init form');

        this.editMode = false;

        if (this.id !== undefined) {

            let index;
            let inputTokenList;

            if (this._tokenService.tokenCreated) {
                index = this._tokenService.findIndexByID(this.tokenList, this.id);
            }

            if (this._tokenService.inputUsed) {
                inputTokenList = this._tokenService.getInputTokenList();
                index = this._tokenService.findIndexByID(inputTokenList, this.id);
            }

            this._logger.info(index);

            if (index !== -1) {
                // edit token
                this.editMode = true;

                if (this._tokenService.tokenCreated) {

                    this.editToken = this.tokenList[index];
                    this.simpleTokenForm = this.fb.group({
                        relatedId: [this.editToken.relatedId, [Validators.required, Validators.maxLength(100)]],
                        key: [this.editToken.key, [Validators.required, Validators.maxLength(100)]],
                        value: [this.editToken.value, [Validators.required, Validators.maxLength(100)]]
                    });
                }

                if (this._tokenService.inputUsed) {

                    this.editToken = inputTokenList[index];
                    this.simpleTokenForm = this.fb.group({
                        relatedId: [this.editToken.relatedId, [Validators.required, Validators.maxLength(100)]],
                        key: [this.editToken.key, [Validators.required, Validators.maxLength(100)]],
                        value: [this.editToken.value, [Validators.required, Validators.maxLength(100)]]
                    });
                }

            } else {

                this.editMode = false;

                // id found, but no match in tokenlist
                // new token
                this.simpleTokenForm = this.fb.group({
                    relatedId: [null, [Validators.required, Validators.maxLength(100)]],
                    key: [null, [Validators.required, Validators.maxLength(100)]],
                    value: [null, [Validators.required, Validators.maxLength(100)]]
                });

            }

        } else {

            // new token
            this.simpleTokenForm = this.fb.group({
                relatedId: [null, [Validators.required, Validators.maxLength(100)]],
                key: [null, [Validators.required, Validators.maxLength(100)]],
                value: [null, [Validators.required, Validators.maxLength(100)]]
            });
        }

    }

    submitForm() {
        this._logger.info('submit form pressed');
        this._logger.info('values');
        this._logger.info(this.simpleTokenForm.value);

        let simpleToken;

        this.JSONFormat = false;

        if (this.editMode) {

            const relatedId = this.simpleTokenForm.value.relatedId;
            const key = this.simpleTokenForm.value.key;

            if (this.checkInputIdOrKeyForJSONNumbers(relatedId)) {
                return;
            }
            if (this.checkInputIdOrKeyForJSONNumbers(key)) {
                return;
            }

            this.editToken.relatedId = relatedId;
            this.editToken.key = key;

            // set value
            const value = this.simpleTokenForm.value.value;
            // trim white spaces
            const trimmedValue = value.replace(/\r?\n/g, '');

            if (this.checkInputValue(trimmedValue)) {
                this.JSONFormat = true;
                return;
            }

            // // not a valid JSON format with brackets
            if (this.JSONFormat) {
                this.resetForm();
                return;
            }

            this.editToken.value = trimmedValue;

            if (this._tokenService.inputUsed) {
                this._tokenService.tokenCreated = false;
                this._tokenService.inputUsed = true;
            } else {
                this._tokenService.tokenCreated = true;
                this._tokenService.inputUsed = false;
            }


            this._tokenService.postTokenToDb(this.editToken)
                .subscribe(res => {
                    this._logger.info('post token res');
                    this._logger.info(res);
                });

        } else {
            simpleToken = new TokenModel;
            simpleToken.relatedId = this.simpleTokenForm.value.relatedId;
            simpleToken.key = this.simpleTokenForm.value.key;
            simpleToken.value = this.simpleTokenForm.value.value;

            if (this.checkInputIdOrKeyForJSONNumbers(simpleToken.relatedId)) {
                return;
            }
            if (this.checkInputIdOrKeyForJSONNumbers(simpleToken.key)) {
                return;
            }

            // trim white spaces
            const trimmedValue = simpleToken.value.replace(/\r?\n/g, '');

            if (this.checkInputValue(trimmedValue)) {
                this.JSONFormat = true;
                return;
            }

            // // not a valid JSON format with brackets
            if (this.JSONFormat) {
                this.resetForm();
                return;
            }

            simpleToken.value = trimmedValue;

            this._logger.info('Show object to be stored');
            this._logger.info(simpleToken);

            this._tokenService.tokenCreated = true;
            this._tokenService.inputUsed = false;

            this._tokenService.postTokenToDb(simpleToken)
                .subscribe(res => {
                    this._logger.info('Response from postTokenToDb');
                    this._logger.info(res);
                });

            this._tokenService.storeToken(simpleToken);
            this._logger.info('show simple token list');
            this._tokenService.showTokenList();
        }

        this.resetForm();
    }

    // if true, return
    checkInputValue(value: string): boolean {

        if (this._tokenService.IsJsonString(value)) {

            const testANumber = parseInt(value, 10);
            this._logger.info('Show number');
            this._logger.info('test');
            this._logger.info(testANumber);

            const notANumber = isNaN(testANumber);
            this._logger.info(notANumber);

            if (notANumber) {
                this.JSONFormat = true;
                return true;
            }

            return false;
        }

        this._logger.info('return false');
        return false;
    }

    // if true, return
    checkInputIdOrKeyForJSONNumbers(value: string): boolean {

        if (!this._tokenService.IsJsonString(value)) {
            return false;
        }

        if (this._tokenService.IsJsonString(value)) {
            const testANumber = parseInt(value, 10);
            const notANumber = isNaN(testANumber);
            this._logger.info('Show nan');
            this._logger.info(notANumber);

            if (!notANumber) {
                return false;
            }
        }

        this.JSONFormat = true;
        return true;
    }

    resetForm() {
        this.simpleTokenForm.reset();
    }
}
