import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RealEstateSearchService {
  searchResult: Subject<any> = new Subject<any>();
  ad: Subject<any> = new Subject<any>();

  constructor() { }

  // function which will get real estate search result
  getSearchResults(): Observable<any> {
    return this.searchResult.asObservable();
  }

  // function which will set real estate search result
  setSearchResults(searchResult: any) {
    this.searchResult.next(searchResult);
  }

  // function which will get single real estate
  getAd(): Observable<any> {
    return this.ad.asObservable();
  }

  // function which will set single real estate
  setAd(ad: any) {
    this.ad.next(ad);
  }


}
