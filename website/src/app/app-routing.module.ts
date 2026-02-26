import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HelloComponent } from './hello/hello.component';

const routes: Routes = [
  // { path: '', component: AppComponent, children: [

  // ]}
  { path: '', component: HelloComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(a => a.AdminModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


// / -> website
// /admin -> mobile
