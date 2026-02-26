import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { HelloComponent } from './hello/hello.component';

// Ext Modules
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgxCaptureModule } from 'ngx-capture';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    HelloComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AutocompleteLibModule,
    NgxCaptureModule,
    SharedModule
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
