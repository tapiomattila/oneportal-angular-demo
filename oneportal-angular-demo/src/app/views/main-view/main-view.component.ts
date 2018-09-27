import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {

  constructor(private router: Router,
    private route: ActivatedRoute,
    private _authService: AuthService,
    private _logger: LoggingService) { }

  ngOnInit() {

  }

  toSimple() {
    this.router.navigate(['simple'], { relativeTo: this.route });
  }

  toComplex() {
    this.router.navigate(['complex'], { relativeTo: this.route });
  }

  toList() {
    this.router.navigate(['list'], { relativeTo: this.route });
  }

  toProfile() {
    this.router.navigate(['profile'], { relativeTo: this.route });
  }

  signout() {
    this._logger.info('signout pressed');
    this._authService.signout();
  }

}
