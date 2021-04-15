import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreditosComponent } from './pages/creditos/creditos.component';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';


const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'creditos', component: CreditosComponent},

    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
