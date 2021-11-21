import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { City } from './cities';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.less']
})
export class CitiesComponent implements OnInit {

  public displayedColumns: string[] = ['id', 'name', 'lat', 'lon'];
  public cities: MatTableDataSource<City>;
  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: string = "asc";
  defaultFilterColumn: string = "name";
  filterQuery: string = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(query: string = null) {
    console.log(query);
    var pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;

    if (query) {
      this.filterQuery = query;
    }

    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    var url = this.baseUrl + 'api/Cities';
    var params = new HttpParams()
      .set("pageIndex", event.pageIndex.toString())
      .set("pageSize", event.pageSize.toString())
      .set("sortColumn", (this.sort) ? this.sort.active : this.defaultSortColumn)
      .set("sortOrder", (this.sort) ? this.sort.direction : this.defaultSortOrder);

    if (this.filterQuery) {
      params = params
        .set("filterColumn", this.defaultFilterColumn)
        .set("filterQuery", this.filterQuery);
    }

    console.log((this.sort) ? this.sort.direction : this.defaultSortOrder);

    this.http.get<any>(url, { params }).subscribe(
      result => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;

        this.cities = new MatTableDataSource<City>(result.data);
      },
      err => { console.error(err) }
    );
  }

}
