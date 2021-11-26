import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { BaseFormComponent } from '../../base.form.component';
import { Country } from '../../countries/country';
import { City } from '../cities';

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
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {
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

      var url = this.baseUrl + "api/Cities/IsDupeCity";

      return this.http.post<boolean>(url, city).pipe(map(result => {
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
      var url = this.baseUrl + "api/Cities/" + this.id;
      this.http.get<City>(url).subscribe(
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
    var url = this.baseUrl + "api/Countries";
    var params = new HttpParams()
      .set("pageIndex", "0")
      .set("pageSize", "9999")
      .set("sortColumn", "name");

    this.http.get<any>(url, { params }).subscribe(
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
      var url = this.baseUrl + "api/Cities/" + this.city.id;

      this.http.put<City>(url, city)
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
      var url = this.baseUrl + "api/Cities";
      this.http.post<City>(url, city)
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
