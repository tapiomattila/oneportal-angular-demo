import { Injectable } from '../../../node_modules/@angular/core';
import { HttpClient, HttpErrorResponse } from '../../../node_modules/@angular/common/http';
import { Router } from '../../../node_modules/@angular/router';
import { User } from '../common/user.model';
import { throwError } from '../../../node_modules/rxjs';
import { catchError } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private isAuthenticated = false;
    private authTimer: any;

    signoutNotice = false;
    profile: User;

    private token: string;

    constructor(private http: HttpClient,
        private router: Router,
        private _logger: LoggingService) { }

    postAuthCode(code: string) {
        this._logger.info('in send auth code');
        this._logger.info(code);

        const codeObj = {
            value: code
        };

        this.http.post<{ token: string, message: string, isValid: boolean, expires_in: string }>(BACKEND_URL + '/auth/code/', codeObj)
            .pipe(
                catchError(this.handleError)
            )
            .subscribe(res => {
                this._logger.info('code send response');
                this._logger.info(res);

                if (res.isValid && res.token) {
                    this._logger.info('Token retrieved');
                    this.isAuthenticated = true;

                    this.token = res.token;

                    console.log("signed in");

                    const expireTime = res.expires_in;
                    this._logger.info(expireTime);
                    const expireTimeInt = parseInt(expireTime, 10);
                    this.setExpireAuthTimer(expireTimeInt);

                    const now = new Date();
                    const expirationTime = now.getTime() + parseInt(expireTime, 10);
                    this.saveAuthData(expirationTime);

                    this.getUserInfo();

                    setTimeout(() => {
                        this.router.navigate(['/mainview']);
                    }, 800);
                }

            });
    }

    setExpireAuthTimer(expireTime: number) {
        const usedDuration = expireTime; 
        console.log('Setting timer: ' + usedDuration);
        this.authTimer = setTimeout(() => {
            this._logger.info('authTimer run out -> signout');
            this.signoutNotice = true;
            this.signout();
        }, usedDuration);
    }

    private saveAuthData(expires_in: number) {
        localStorage.setItem('expires_in', expires_in.toString());
    }

    private removeAuthData() {
        localStorage.removeItem('expires_in');
    }

    checkToken() {
        return this.http.get<{ boolValue: boolean }>(BACKEND_URL + '/auth/validatetoken/')
            .map(res => {
                if (res.boolValue) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    getToken() {
        return this.token;
    }

    private createToken() {

        this._logger.info("in create token");

        let cookieToken;
        let cookieArray = [];
        let allCookies = document.cookie;
        let cookies = allCookies.split(";");
        for (var i = 0; i < cookies.length; i++) {
            cookieArray.push(cookies[i]);
        }

        this._logger.info("show all cookies");

        for (var i = 0; i < cookieArray.length; i++) {

            if (cookieArray[i].indexOf("crypt_token-x12s") != -1) {
                this._logger.info(cookieArray[i]);
                cookieToken = cookieArray[i];
            } else {
                this._logger.info("NOT FOUND");
            }
        }

        if (cookieToken) {
            this._logger.info("show token");
            this._logger.info(cookieToken);

            let parsedToken = cookieToken.substring(cookieToken.indexOf("crypt_token-x12s") + 17);
            this._logger.info("parsed token");
            this._logger.info(parsedToken);

            return parsedToken;
        }

        return null;
    }

    private getAuthData() {

        if (!this.checkToken()) {
            this._logger.info('Show checkToken() FALSE');
            return;
        }

        if (this.checkToken()) {
            this._logger.info('Show checkToken() TRUE');
            const expires_in = localStorage.getItem('expires_in');
            this._logger.info(expires_in);

            const authData = {
                expires_in: expires_in,
            };
            return authData;
        }

    }

    autoAuthUser() {

        this.token = this.createToken();
        this.profile = new User();

        const authInformation = this.getAuthData();
        this._logger.info('Show auth info in auto: ');
        this._logger.info(authInformation);

        if (!authInformation || this.token == null) {
            this.getDestroySession();
            return;
        }

        const time = authInformation.expires_in;
        const timeInt = parseInt(time, 10);
        const now = new Date();
        const expiresIn = (timeInt - now.getTime());

        this._logger.info("show time difference");
        this._logger.info(expiresIn);

        console.log("signed in");

        if (expiresIn < 0) {
            this._logger.info('under 0');
            this._logger.info(expiresIn);
            return;
        }

        // date is in the future
        if (expiresIn > 0) {
            this.isAuthenticated = true;

            this.getUserInfo();

            this.setExpireAuthTimer(expiresIn);
        }
    }

    signout() {
        this.isAuthenticated = false;
        this.token = null;
        this.getDestroySession();
        this.removeAuthData();
        clearTimeout(this.authTimer);
    }

    getUserInfo() {
        this.http.get<{ email: string, given_name: string, family_name: string, preferred_username: string }>(BACKEND_URL + '/auth/user')
            .pipe(
                catchError(this.handleError)
            )
            .subscribe(res => {
                this._logger.info('res from user');
                this._logger.info(res);
                if (res != null) {

                    this.profile.email = res.email;
                    this.profile.first_name = res.given_name;
                    this.profile.last_name = res.family_name;
                    this.profile.username = res.preferred_username;
                }
            });
    }

    getDestroySession() {
        this.http.get<{message: string, auth: boolean }>(BACKEND_URL + '/auth/destroysession')
            .pipe(
                catchError(this.handleError)
            )
            .subscribe(res => {
                this._logger.info('res from destroysession');
                this._logger.info(res);
                if (!res.auth) {
                    console.log("sign out");
                    setTimeout(() => {
                        this.router.navigate(['signin']);
                    }, 400);
                }
            });
    }

    private handleError(errorResponse: HttpErrorResponse) {
        if (errorResponse.error instanceof ErrorEvent) {
            this._logger.info('Client side Error: ', errorResponse.error.message);
        } else {
            this._logger.info('Server side Error: ', errorResponse);
        }

        return throwError('There is a problem with the service. We are notified & working on it. Please try again later.');
    }

}
