import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './components/login/login.component';
import { RegDashboardComponent } from './components/reg-dashboard/reg-dashboard.component';
import { RegListComponent } from './components/reg-list/reg-list.component';

const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [

      { path: '', pathMatch:'full',redirectTo:'registerations' },
      { path: 'login', component: LoginComponent },
      { path: 'registerations', component: RegListComponent },
      { path: 'dashboard', component: RegDashboardComponent },
    ]
  },

  // login
  // dashboard
  // list
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
