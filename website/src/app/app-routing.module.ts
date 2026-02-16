import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { StockChartComponent } from './stock-chart/stock-chart.component';

const routes: Routes = [
  // { path: '', component: AppComponent, children: [

  // ]}
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'stock-chart', component: StockChartComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(a => a.AdminModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


// / -> website
// /admin -> mobile