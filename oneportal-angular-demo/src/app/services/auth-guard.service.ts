import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from '../../../node_modules/rxjs';
import { HttpClient, HttpErrorResponse } from '../../../node_modules/@angular/common/http';
import 'rxjs/add/operator/map';
import { throwError } from '../../../node_modules/rxjs';
import { catchError } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

    constructor(private http: HttpClient,
        private router: Router,
        private _logger: LoggingService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkValidAccessToken();
    }

    checkValidAccessToken() {
        return this.http.get<{ boolValue: boolean }>(BACKEND_URL+'/auth/validatetoken/')
            .pipe(
                catchError(this.handleError)
            )
            .map(res => {
                this._logger.info('can activate res');
                this._logger.info(res);
                if (res.boolValue) {
                    return true;
                } else {
                    this.router.navigate(['/signin']);
                    return false;
                }
            });
    }

    private handleError(errorResponse: HttpErrorResponse) {
        if (errorResponse.error instanceof ErrorEvent) {
            console.log('Client side Error: ', errorResponse.error.message);
        } else {
            console.log('Server side Error: ', errorResponse);
        }

        return throwError('There is a problem with the service. We are notified & working on it. Please try again later.');
    }
}
