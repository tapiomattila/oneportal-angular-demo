import { Injectable } from '../../../node_modules/@angular/core';
import { TokenModel } from '../common/token-model.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from '../../../node_modules/rxjs';
import { throwError } from '../../../node_modules/rxjs';
import { catchError} from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class TokenDBService {

    constructor(private httpClient: HttpClient,
                private _logger: LoggingService) { }

    // POST
    postToken(token: TokenModel): Observable<TokenModel> {

        const storedToken = {
            relatedId: token.relatedId,
            key: token.key,
            value: token.value
        };

        console.log('storedToken');
        console.log(storedToken);

        return this.httpClient.post<TokenModel>(BACKEND_URL+'/token/', storedToken)
            .pipe(
                catchError(this.handleError)
            );
    }

    // GET
    getTokens(relatedId: string): Observable<TokenModel[]> {

        const id = relatedId;
        return this.httpClient.get<TokenModel[]>(BACKEND_URL+'/token/' + id)
            .pipe(
                catchError(this.handleError)
            );
    }

    // DELETE
    deleteToken(token: TokenModel): Observable<TokenModel> {

        const id = token.relatedId;
        const key = token.key;
        return this.httpClient.delete<TokenModel>(BACKEND_URL+'/token/' + id + '/' + key)
            .pipe(
                catchError(this.handleError)
            );
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
