import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { BaseFormComponent } from '../../base.form.component';
import { ApiResult } from '../../base.service';
import { Country } from '../../countries/country';
import { City } from '../cities';
import { CityService } from '../city.service';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.less']
})
export class CityEditComponent extends BaseFormComponent implements OnInit {
  //the view title
  title: string;

  //the form model
  form: FormGroup;

  //the city object to edit or create
  city: City;

  //the city object id, as fetched from the active route:
  //It's NULL when we're adding a new city, and not NULL when we're editing an existing one.
  id?: number;

  //the countries array for the select field
  countries: Country[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      lat: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4}?$)/)]),
      lon: new FormControl('', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4}?$)/)]),
      countryId: new FormControl('', Validators.required)
    }, null, this.isDupeCity());

    this.loadData();
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any }> | null => {
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.get("name").value;
      city.lat = +this.form.get("lat").value;
      city.lon = +this.form.get("lon").value;
      city.countryId = +this.form.get("countryId").value;

      return this.cityService.isDupeCity(city).pipe(map(result => {
        return (result ? {isDupeCity: true} : null)
      }));
    }
  }

  loadData() {
    //load countries
    this.loadCountries();

    //retrieve the ID from the 'id' parameter
    this.id = +this.activatedRoute.snapshot.paramMap.get('id');

    if (this.id) {
      //EDIT Mode
      //fetch the city from the server
      this.cityService.get<City>(this.id).subscribe(
        res => {
          this.city = res;
          this.title = "Edit - " + this.city.name;

          //update the form with the city value
          this.form.patchValue(this.city);

        },
        err => { console.error(err) }
      )
    }
    else {
      //Add new mode
      this.title = "Create a new City";
    }
   
  }

  loadCountries() {
    //fetch all the countries from the server
    this.cityService.getCountries<ApiResult<Country>>(
      0,
      9999,
      "name",
      null,
      null,
      null
    ).subscribe(
      result => {
        this.countries = result.data;
      },
      err => {console.error(err)}
    )
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};
    city.name = this.form.get("name").value;
    city.lat = +this.form.get("lat").value;
    city.lon = +this.form.get("lon").value;
    city.countryId = +this.form.get("countryId").value;

    if (this.id) {
      //Edit mode
      this.cityService.put<City>(city)
        .subscribe(
          result => {
            console.log("City" + city.id + " has been updated.");

            //go back to cities view
            this.router.navigate(['/cities']);
          },
          err => { console.error(err) }
        )
    }
    else {
      //Add new mode
      this.cityService.post<City>(city)
        .subscribe(
          result => {
            console.log("City " + result.id + " has been created.");

            //go back to cities view
            this.router.navigate(['/cities']);
          }
        )
    }
    
  }
}
