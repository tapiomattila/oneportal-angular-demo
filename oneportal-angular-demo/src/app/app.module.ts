import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainViewComponent } from './views/main-view/main-view.component';
import { ProfileComponent } from './views/main-view/components/profile/profile.component';
import { ComplexTokenComponent } from './views/main-view/components/complex-token/complex-token.component';
import { ListViewComponent } from './views/main-view/components/list-view/list-view.component';
import { AppRoutingModule } from './app-routing.module';
import { SigninPageComponent } from './views/signin-page/signin-page.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '../../node_modules/@angular/common/http';
import { LoggingService } from './services/logging.service';
import { ConsoleLoggerService } from './services/console-logger.service';
import { SimpleTokenComponent } from './views/main-view/components/simple-token/simple-token.component';
import { AuthInterceptor } from './services/auth-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    ProfileComponent,
    SimpleTokenComponent,
    ComplexTokenComponent,
    ListViewComponent,
    SigninPageComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: LoggingService, useClass: ConsoleLoggerService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
