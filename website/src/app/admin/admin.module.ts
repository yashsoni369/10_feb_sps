import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { RegListComponent } from './components/reg-list/reg-list.component';
import { RegDashboardComponent } from './components/reg-dashboard/reg-dashboard.component';
import { LoginComponent } from './components/login/login.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  declarations: [
    AdminComponent,
    RegListComponent,
    RegDashboardComponent,
    LoginComponent
    ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
  ]
})
export class AdminModule { }
