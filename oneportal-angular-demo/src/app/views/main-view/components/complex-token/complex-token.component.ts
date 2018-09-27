import { OnInit, Component } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { TokenService } from "../../../../services/token.service";
import { TokenModel } from "../../../../common/token-model.model";
import { ActivatedRoute, Router } from "../../../../../../node_modules/@angular/router";
import { LoggingService } from "../../../../services/logging.service";

@Component({
    selector: "app-complex-token",
    templateUrl: "./complex-token.component.html",
    styleUrls: ["./complex-token.component.css"]
})
export class ComplexTokenComponent implements OnInit {

    complexTokenForm: FormGroup;
    notJSON = 0;
    id: string;
    editMode = false;
    private editToken: TokenModel;
    private tokenList: TokenModel[];

    constructor(private fb: FormBuilder,
        private _tokenService: TokenService,
        private route: ActivatedRoute,
        private router: Router,
        private _logger: LoggingService) { }

    ngOnInit() {
        this.checkURLParams();
        this.getTokenList();
        this.initForm();
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

            if (index !== -1) {
                // edit token
                this.editMode = true;
                if (this._tokenService.tokenCreated) {

                    this.editToken = this.tokenList[index];
                    this.complexTokenForm = this.fb.group({
                        relatedId: [this.editToken.relatedId, [Validators.required, Validators.maxLength(100)]],
                        key: [this.editToken.key, [Validators.required, Validators.maxLength(100)]],
                        value: [this.editToken.value, [Validators.required, Validators.maxLength(100)]]
                    });
                }

                if (this._tokenService.inputUsed) {
                    this.editToken = inputTokenList[index];
                    this.complexTokenForm = this.fb.group({
                        relatedId: [this.editToken.relatedId, [Validators.required, Validators.maxLength(100)]],
                        key: [this.editToken.key, [Validators.required, Validators.maxLength(100)]],
                        value: [this.editToken.value, [Validators.required, Validators.maxLength(100)]]
                    });
                }
            } else {
                this.editMode = false;

                // id found, but no match in tokenlist
                this.complexTokenForm = this.fb.group({
                    relatedId: [null, [Validators.required, Validators.maxLength(100)]],
                    key: [null, [Validators.required, Validators.maxLength(100)]],
                    value: [null, [Validators.required, Validators.maxLength(100)]]
                });

            }

        } else {
            // new token
            this.editMode = false;

            this.complexTokenForm = this.fb.group({
                relatedId: [null, [Validators.required, Validators.maxLength(100)]],
                key: [null, [Validators.required, Validators.maxLength(100)]],
                value: [null, [Validators.required, Validators.maxLength(100)]]
            });
        }
    }

    submitForm() {
        this._logger.info('submit form pressed');
        this.notJSON = 0;

        let complexToken;
        let trimmedValueNoBreaks;
        let trimmedValue;

        this._logger.info('editmode');
        this._logger.info(this.editMode);

        if (this.editMode) {

            const relatedId = this.complexTokenForm.value.relatedId;
            const key = this.complexTokenForm.value.key;

            this.editToken.relatedId = relatedId;
            this.editToken.key = key;

            // set value
            const value = this.complexTokenForm.value.value;
            trimmedValueNoBreaks = value.replace(/\r?\n/g, '');
            trimmedValue = trimmedValueNoBreaks;

            this.editToken.value = trimmedValue;

            this._logger.info('Show editToken');
            this._logger.info(this.editToken);

            if (this.checkInputIdOrKeyForJSONNumbers(this.editToken.relatedId)) {
                return;
            }
            if (this.checkInputIdOrKeyForJSONNumbers(this.editToken.key)) {
                return;
            }

            if (this.checkInputValue(this.editToken.value)) {
                this.notJSON = 2;
                return;
            }

            // // not a valid JSON format with brackets
            if (this.notJSON === 2) {
                this.resetForm();
                return;
            }

            // JSON format string
            if (this._tokenService.IsJsonString(this.editToken.value)) {

                this._logger.info('Show JSON format string');
                this.editToken.value = trimmedValue.replace(/\s/g, '');

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
                this._logger.info(this.editToken);
            }

        } else {
            complexToken = new TokenModel;
            complexToken.relatedId = this.complexTokenForm.value.relatedId;
            complexToken.key = this.complexTokenForm.value.key;

            const value = this.complexTokenForm.value.value;
            trimmedValueNoBreaks = value.replace(/\r?\n/g, '');
            trimmedValue = trimmedValueNoBreaks;

            // complexToken.relatedId
            // complexToken.key
            // trimmedValue

            if (this.checkInputIdOrKeyForJSONNumbers(complexToken.relatedId)) { return; }
            if (this.checkInputIdOrKeyForJSONNumbers(complexToken.key)) { return; }

            if (this.checkInputValue(trimmedValue)) {
                this.notJSON = 2;
                return;
            }

            // not a valid JSON format with brackets
            if (this.notJSON === 2) {
                this.resetForm();
                return;
            }

            // JSON format string
            if (this._tokenService.IsJsonString(trimmedValue)) {

                this._logger.info('Show JSON format string');
                complexToken.value = trimmedValue.replace(/\s/g, '');
                this._logger.info(complexToken);

                this._tokenService.tokenCreated = true;
                this._tokenService.inputUsed = false;

                this._tokenService.postTokenToDb(complexToken)
                    .subscribe(res => {
                        this._logger.info('post token res');
                        this._logger.info(res);
                    });
                this._tokenService.storeToken(complexToken);
            }
        }

        this.resetForm();
        if (this.editMode) {
            this.router.navigate(['../'], { relativeTo: this.route });
        }
    }

    // if not json value return true
    checkInputValue(value: string): boolean {
        if (!this._tokenService.IsJsonString(value)) {
            return true;
        }

        if (this._tokenService.IsJsonString(value)) {

            const testANumber = parseInt(value, 10);
            this._logger.info('Show number');
            this._logger.info(testANumber);

            const notANumber = isNaN(testANumber);
            this._logger.info(notANumber);

            if (!notANumber) {
                this.notJSON = 2;
                return true;
            }

            return false;
        }

        return true;
    }

    // if not json value return false
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

        this.notJSON = 1;
        return true;
    }

    resetForm() {
        this.complexTokenForm.reset();
    }
}
