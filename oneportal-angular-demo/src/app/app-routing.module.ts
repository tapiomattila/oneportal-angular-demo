import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainViewComponent } from './views/main-view/main-view.component';
import { SigninPageComponent } from './views/signin-page/signin-page.component';
import { ListViewComponent } from './views/main-view/components/list-view/list-view.component';
import { ComplexTokenComponent } from './views/main-view/components/complex-token/complex-token.component';
import { ProfileComponent } from './views/main-view/components/profile/profile.component';
import { AuthGuardService } from './services/auth-guard.service';
import { SimpleTokenComponent } from './views/main-view/components/simple-token/simple-token.component';

const routes: Routes = [
   { path: '', redirectTo: 'signin', pathMatch: 'full' },
   { path: 'signin', component: SigninPageComponent },
   { path: 'mainview', component: MainViewComponent, canActivate: [AuthGuardService], children: [
       { path: 'simple', component: SimpleTokenComponent },
       { path: 'simple/:id', component: SimpleTokenComponent },
       { path: 'complex', component: ComplexTokenComponent },
       { path: 'complex/:id', component: ComplexTokenComponent },
       { path: 'list', component: ListViewComponent },
       { path: 'profile', component: ProfileComponent }
   ] },
   { path: '**', component: SigninPageComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
