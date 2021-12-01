import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { CitiesComponent } from './cities/cities.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { CountriesComponent } from './countries/countries.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CityEditComponent } from './cities/city-edit/city-edit.component';
import { CountryEditComponent } from './countries/country-edit/country-edit.component';
import { ApiAuthorizationModule } from '../api-authorization/api-authorization.module';
import { AuthorizeInterceptor } from '../api-authorization/authorize.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    CitiesComponent,
    CountriesComponent,
    CityEditComponent,
    CountryEditComponent
  ],
  imports: [
    BrowserModule,
    ApiAuthorizationModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    ReactiveFormsModule
  ],
  providers: [
    HttpClientModule,
    {provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
