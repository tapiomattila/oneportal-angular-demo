import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggingService } from '../../services/logging.service';
import { environment } from "../../../environments/environment";

const client_id = environment.oidc_client_id;
const redirectUrl = environment.redirectUrl;
const oidc_auth_path = environment.oidc_auth_path;

@Component({
    selector: "app-signin-page",
    templateUrl: "./signin-page.component.html",
    styleUrls: ["./signin-page.component.css"]
})
export class SigninPageComponent implements OnInit {

    private state: string;

    constructor(private router: Router,
                public _authService: AuthService,
                private _logger: LoggingService
            ) { }

    ngOnInit() {
        this.state = this.createState();
        this.checkAuth();
        setTimeout(() => {
            this._authService.signoutNotice = false;
        }, 4000);

    }

    checkAuth() {

        const getAuth = window.location.href;

        if (getAuth.includes('code=')) {

            const code = getAuth.substring(getAuth.indexOf('=') + 1, getAuth.indexOf('&'));
            this._logger.info(code);

            this._authService.postAuthCode(code);

        } else {
            this._logger.info('not including code=');
        }
    }

    toMainView() {
        this.router.navigate(['/mainview']);
    }

    createState() {
        let pass = Math.random().toString(36).substr(2, 9);
        let pass2 = Math.random().toString(36).substr(2, 9);
        let pass3 = Math.random().toString(36).substr(2, 5);
        return pass+pass2+pass3;
    }

    startAuth() {
        window.location.href = `${oidc_auth_path}?response_type=code&client_id=${client_id}&redirect_uri=${redirectUrl}&scope=openid%20email%20profile&state=${this.state}`;
    }
}
