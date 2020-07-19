import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})
export class RealEstateOfferService {

  constructor(private http: HttpClient) {
  }

  // function which will handle post real estate offer request
  postRealEstateOffer(offer) {
    return this.http.post(baseURL + "offer", offer);
  }

  // function which will handle get all real estate offers which are not in progress
  getRealEstateOffers() {
    return this.http.get(baseURL + 'offer');
  }

  // function which will handle post real estate offer in progress of an agent request
  processOffer(requestData) {
    return this.http.post<any>(baseURL + 'offer/processoffer', requestData)
      .pipe(res => { return res },
        catchError(error => this.handleError(error)));
  }

  // function which will handle get real estate offers processing by the agent with forwarded id request
  getOffersIProcess(_id) {
    return this.http.get(baseURL + 'offer/offersinprocess/' + _id);
  }

  deleteOfferRealEstate(realEstateOfferId, agentId) {
    return this.http.delete(baseURL + 'offer/delete-real-estate/' + realEstateOfferId + '/' + agentId);
  }

  // function which will handle errors
  handleError(err: HttpErrorResponse | any) {
    let errorMessage: string;
    if (err.error.success !== undefined)
      errorMessage = err.error.statusMessage;
    else
      errorMessage = `${err.status} - ${err.statusText || ''} ${err.message}`;

    return throwError(errorMessage);
  }
}
