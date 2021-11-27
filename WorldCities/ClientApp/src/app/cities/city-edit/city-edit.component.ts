import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class CityEditComponent extends BaseFormComponent implements OnInit, OnDestroy {
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
  countries: Observable<ApiResult<Country>>;

  //Activity log (for debugging purposes)
  activityLog: string = "";

  subscriptions: Subscription = new Subscription();

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

    //react to form changes
    this.subscriptions.add(
      this.form.valueChanges
        .subscribe(() => {
          if (!this.form.dirty) {
            this.log("Form Model has been loaded.");
          }
          else {
            this.log("Form was updated by the user.");
          }
        })
    );

    //react to changes in the form.name control
    this.subscriptions.add(
      this.form.get("name")!.valueChanges
        .subscribe(() => {
          if (!this.form.dirty) {
            this.log("Name has been loaded with initial values");
          }
          else {
            this.log("Name was updated by the user");
          }
        })
    );

    this.loadData();
  }

  log(str: string) {
    //this.activityLog += "[" + new Date().toLocaleString() + "] " + str + "<br />";
    console.log("[" + new Date().toLocaleString() + "] " + str + "<br />");
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
      this.subscriptions.add(
        this.cityService.get<City>(this.id).subscribe(
          res => {
            this.city = res;
            this.title = "Edit - " + this.city.name;

            //update the form with the city value
            this.form.patchValue(this.city);
          },
          err => { console.error(err) }
        )
      );
    }
    else {
      //Add new mode
      this.title = "Create a new City";
    }
   
  }

  loadCountries() {
    //fetch all the countries from the server
    //Alternative subscription that will unsubscribe automatically
    this.countries = this.cityService
      .getCountries<ApiResult<Country>>(
        0,
        9999,
        "name",
        null,
        null,
        null
      );
    //this.subscriptions.add(
    //  this.cityService.getCountries<ApiResult<Country>>(
    //    0,
    //    9999,
    //    "name",
    //    null,
    //    null,
    //    null
    //  ).subscribe(
    //    result => {
    //      this.countries = result.data;
    //    },
    //    err => { console.error(err) }
    //  )
    //);
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};
    city.name = this.form.get("name").value;
    city.lat = +this.form.get("lat").value;
    city.lon = +this.form.get("lon").value;
    city.countryId = +this.form.get("countryId").value;

    if (this.id) {
      //Edit mode
      this.subscriptions.add(
        this.cityService.put<City>(city)
          .subscribe(
            result => {
              console.log("City" + city.id + " has been updated.");

              //go back to cities view
              this.router.navigate(['/cities']);
            },
            err => { console.error(err) }
          )
      );
    }
    else {
      //Add new mode
      this.subscriptions.add(
        this.cityService.post<City>(city)
          .subscribe(
            result => {
              console.log("City " + result.id + " has been created.");

              //go back to cities view
              this.router.navigate(['/cities']);
            }
          )
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
